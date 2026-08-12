import { failAPI, successAPI } from '~~/server/utils/response'
import { db } from '~~/server/db/index'
import { uploadFile } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return failAPI(event, '参数错误')

    await db.delete(uploadFile).where(eq(uploadFile.id, id))

    return successAPI(null, '删除成功', event)
  } catch (err) {
    console.error('❌ 删除文件失败：', (err as Error).message)
    return failAPI(event, (err as Error).message || '删除文件失败')
  }
})