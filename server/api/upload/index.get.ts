import { failAPI, successAPI } from '~~/server/utils/response'
import { db } from '~~/server/db/index' // 导入数据库实例
import { uploadFile } from '~~/server/db/schema' // 导入表结构

export default defineEventHandler(async (event) => {
  try {
    const res = await db.select().from(uploadFile)

    return successAPI({
      data: res.map(item => ({
        id: item.id,
        filename: item.fileName,
        suffix: item.suffix,
      })),
      msg: "获取上传文件列表成功",
    })
  } catch (error) {
    return failAPI(event, (error as Error)?.message || "获取上传文件列表失败")
  }
})