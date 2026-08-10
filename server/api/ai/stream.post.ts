import { streamChat } from '~~/server/model'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const messages = body?.messages
  const modelName = body?.modelName || 'deepseek-v4-pro'
  console.log('[后端] 收到请求 → modelName:', modelName)

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ code: 400, msg: '消息内容不能为空' })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')
  if (!lastUserMsg) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ code: 400, msg: '请输入您的问题' })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(messages, modelName)) {
          const payload = `event: message\ndata: ${JSON.stringify({ content: chunk })}\n\n`
          controller.enqueue(encoder.encode(payload))
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