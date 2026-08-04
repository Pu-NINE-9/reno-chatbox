import { failAPI, successAPI } from '~~/server/utils/response'
import { user } from '~~/server/db/schema'
import { db } from '~~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const res = await db.select().from(user)

    // 外层 return，正常返回给前端
    return successAPI(res)
  } catch (err) {
    globalThis.console.error('❌ 数据库查询失败：', (err as Error).message)
    return failAPI((err as Error).message)
  }
})
