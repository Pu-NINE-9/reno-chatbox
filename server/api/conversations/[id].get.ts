import { successAPI, failAPI } from '~~/server/utils/response'
import { conversations, messages } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return failAPI(event, '参数错误')

    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)
    if (!conv.length) return failAPI(event, '对话不存在')

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt))

    return successAPI({ conversation: conv[0], messages: msgs }, '获取对话详情成功', event)
  } catch (err) {
    console.error('❌ 获取对话详情失败：', (err as Error).message)
    return failAPI(event, (err as Error).message || '获取对话详情失败')
  }
})