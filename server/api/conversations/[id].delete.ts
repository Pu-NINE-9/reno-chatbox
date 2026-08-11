import { successAPI, failAPI } from '~~/server/utils/response'
import { conversations, messages } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return failAPI(event, '参数错误')

    await db.delete(messages).where(eq(messages.conversationId, id))
    await db.delete(conversations).where(eq(conversations.id, id))

    return successAPI(null, '删除成功')
  } catch (err) {
    console.error('❌ 删除对话失败：', (err as Error).message)
    return failAPI(event, (err as Error).message)
  }
})