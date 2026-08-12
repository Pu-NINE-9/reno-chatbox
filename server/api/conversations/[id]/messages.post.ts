import { successAPI, failAPI } from '~~/server/utils/response'
import { messages, conversations } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return failAPI(event, '参数错误')

    const body = await readBody(event)
    const items = body?.messages
    if (!Array.isArray(items) || !items.length) {
      return failAPI(event, '消息内容不能为空')
    }

    const values = items.map((m: { role: string; content: string }) => ({
      conversationId: id,
      role: m.role,
      content: m.content
    }))

    await db.insert(messages).values(values).execute()

    const userMsg = items.find((m: { role: string }) => m.role === 'user')
    if (userMsg && userMsg.content) {
      const title = userMsg.content.slice(0, 20) + (userMsg.content.length > 20 ? '...' : '')
      await db
        .update(conversations)
        .set({ title })
        .where(eq(conversations.id, id))
    }

    return successAPI(null, '保存成功', event)
  } catch (err) {
    console.error('❌ 保存消息失败：', (err as Error).message)
    return failAPI(event, (err as Error).message || '保存消息失败')
  }
})