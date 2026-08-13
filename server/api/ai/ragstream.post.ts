import { failAPI } from '~~/server/utils/response'
import { ragSearchStream } from '~~/server/model/rag/index'

export default defineEventHandler(async (event) => {
  // 获取POST请求体
  const body = await readBody<{ question: string; topK?: number }>(event)
  const { question } = body

  // 参数校验
  if (!question || question.trim() === "") {
    return failAPI(event, "请输入需要查询的知识库问题")
  }

  // 设置 SSE 流式响应头，开启长连接
  setResponseHeader(event, "Content-Type", "text/event-stream;charset=utf-8")
  setResponseHeader(event, "Cache-Control", "no-cache")
  setResponseHeader(event, "Connection", "keep-alive")

  try {
    // 获取异步文字流
    const tokenStream = ragSearchStream({
      question,
      topK: body.topK ?? 1
    })

    // 循环向前端推送每一块token
    for await (const chunk of tokenStream) {
      event.node.res.write(`data:${JSON.stringify({ chunk })}\n\n`)
    }
    // 流式结束标记
    event.node.res.write(`data:${JSON.stringify({ done: true })}\n\n`)
    event.node.res.end()
  } catch (err) {
    console.error("RAG流式问答异常：", err)
    event.node.res.write(`data:${JSON.stringify({ error: (err as Error).message })}\n\n`)
    event.node.res.end()
  }
})
