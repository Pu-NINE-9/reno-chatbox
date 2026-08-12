import { streamChat } from '~~/server/model'
import { messages, conversations } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const messagesBody = body?.messages
  const modelName = body?.modelName || 'deepseek-v4-pro'
  const conversationId = body?.conversationId ? Number(body.conversationId) : null

  if (!messagesBody || !Array.isArray(messagesBody) || messagesBody.length === 0) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ code: 400, msg: '消息内容不能为空' })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const lastUserMsg = [...messagesBody].reverse().find((m: any) => m.role === 'user')
  if (!lastUserMsg) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ code: 400, msg: '请输入您的问题' })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const encoder = new TextEncoder()
  let fullAssistantContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(messagesBody, modelName)) {
          fullAssistantContent += chunk
          const payload = `event: message\ndata: ${JSON.stringify({ content: chunk })}\n\n`
          controller.enqueue(encoder.encode(payload))
        }

        if (conversationId) {
          try {
            if (lastUserMsg) {
              await db.insert(messages).values({
                conversationId,
                role: 'user',
                content: lastUserMsg.content
              }).execute()
            }
            if (fullAssistantContent) {
              await db.insert(messages).values({
                conversationId,
                role: 'assistant',
                content: fullAssistantContent
              }).execute()
            }
            const title = lastUserMsg.content.slice(0, 20) + (lastUserMsg.content.length > 20 ? '...' : '')
            await db.update(conversations).set({ title, updatedAt: new Date() }).where(eq(conversations.id, conversationId))
          } catch (dbErr) {
            console.error('❌ 数据库保存失败：', dbErr)
          }
        }

        const donePayload = `event: done\ndata: ${JSON.stringify({ code: 200, msg: '完成' })}\n\n`
        controller.enqueue(encoder.encode(donePayload))
      } catch (err) {
        console.error('Stream error:', err)
        const errorPayload = `event: error\ndata: ${JSON.stringify({ code: 500, msg: (err as Error)?.message || '流式响应异常' })}\n\n`
        controller.enqueue(encoder.encode(errorPayload))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
})