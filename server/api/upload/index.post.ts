import { failAPI, successAPI } from '~~/server/utils/response'
import { db } from '~~/server/db/index' // 导入数据库实例
import { uploadFile } from '~~/server/db/schema' // 导入表结构
import { eq } from 'drizzle-orm'

export interface FileInfo {
  filename: string
  type: string
  data: Buffer
}

export default defineEventHandler(async (event) => {
  try {  
    const file = (await readMultipartFormData(event)) as Array<FileInfo> // 接受前端传来的文件
    if (!file || file.length === 0) {
      return failAPI(event, "没有接收到上传文件")
    }
    const targetFile = file[0] as FileInfo


    // 1.拆分文件名与后缀
    const fileName = targetFile.filename
    const nameArr = fileName.split('.')
    const suffix = nameArr.length > 1 ? nameArr.pop() : ''
    
    const queryRes = await db.select().from(uploadFile).where(eq(uploadFile.fileName, fileName))

    if (queryRes.length > 0) return failAPI(event, "文件已存在！")

    // 2.buffer转为utf‑8文本，存入raw_text（csv、txt适用）
    const rawText = targetFile.data.toString('utf-8')

    //3. ORM插入数据库 upload_file
    const [insertResult] = await db.insert(uploadFile).values({
      fileName: fileName,
      suffix: suffix,
      rawText: rawText
    })

    return successAPI({
      data: insertResult,
      msg: "文件上传保存成功",
    })
  } catch (error) {
    return failAPI(event, (error as Error)?.message || "文件上传保存失败")
  }
})