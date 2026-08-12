import { failAPI, successAPI } from '~~/server/utils/response'
import { invokeChat } from '~~/server/model'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const messages = body?.messages

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return failAPI(event, '消息内容不能为空')
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')
    if (!lastUserMsg) {
      return failAPI(event, '请输入您的问题')
    }

    const res = await invokeChat(messages)
    return successAPI(res, 'AI 服务调用成功', event)
  } catch (err) {
    console.error((err as Error)?.message)
    return failAPI(event, (err as Error)?.message || 'AI 服务调用失败')
  }
})
