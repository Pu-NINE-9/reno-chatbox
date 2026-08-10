import { successAPI, failAPI } from '~~/server/utils/response'
import { conversations } from '~~/server/db/schema'
import { db } from '~~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const title = body?.title || '新对话'
    const modelName = body?.modelName || 'deepseek-v4-pro'

    const result = await db
      .insert(conversations)
      .values({ title, modelName })
      .execute()

    return successAPI({ id: Number(result.insertId), title, modelName }, '创建成功')
  } catch (err) {
    console.error('❌ 创建对话失败：', (err as Error).message)
    return failAPI((err as Error).message)
  }
})