import { successAPI, failAPI } from '~~/server/utils/response'
import { conversations } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const list = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
    return successAPI(list)
  } catch (err) {
    console.error('❌ 获取对话列表失败：', (err as Error).message)
    return failAPI((err as Error).message)
  }
})