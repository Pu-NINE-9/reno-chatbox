import { ragSearchStream } from '~~/server/model/rag/index'
import { messages, conversations } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // 前端传递字段叫 messages，不是 messagesBody
  const { question, topK, conversationId, messages } = body
  // 兜底，确保一定是数组
  const messagesBody = Array.isArray(messages) ? messages : []

  if (!question || question.trim() === "") {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ code: 400, msg: "请输入需要查询的知识库问题" })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  // 拿到用户最新提问消息
  const lastUserMsg = [...messagesBody].reverse().find((m: any) => m.role === 'user')

  // SSE 响应头
  setResponseHeader(event, "Content-Type", "text/event-stream;charset=utf-8")
  setResponseHeader(event, "Cache-Control", "no-cache")
  setResponseHeader(event, "Connection", "keep-alive")

  // 用来拼接完整AI返回文本，用于数据库持久化
  let fullAssistantContent = ""

  try {
    const tokenStream = ragSearchStream({
      question,
      topK: topK ?? 3
    })

    // 循环推送分片（键名统一为 content 和普通接口对齐）
    for await (const chunk of tokenStream) {
      if (chunk.trim() !== "") {
        fullAssistantContent += chunk
        event.node.res.write(`data:${JSON.stringify({ content: chunk })}\n\n`)
      }
    }

    // 消息存入数据库
    if (conversationId && lastUserMsg) {
      try {
        await db.insert(messages).values({
          conversationId,
          role: "user",
          content: lastUserMsg.content
        }).execute()
        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: fullAssistantContent
        }).execute()
        const title = lastUserMsg.content.slice(0, 20) + (lastUserMsg.content.length > 20 ? "..." : "")
        await db.update(conversations)
          .set({ title, updatedAt: new Date() })
          .where(eq(conversations.id, conversationId))
      } catch (dbErr) {
        console.error("❌ RAG数据库保存失败：", dbErr)
      }
    }

    // 结束标记
    event.node.res.write(`data:${JSON.stringify({ done: true, content: "" })}\n\n`)
    event.node.res.end()
  } catch (err) {
    console.error("RAG流式问答异常：", err)
    event.node.res.write(`data:${JSON.stringify({ error: (err as Error).message })}\n\n`)
    event.node.res.end()
  }
})
