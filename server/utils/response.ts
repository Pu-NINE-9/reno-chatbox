import type { H3Event } from 'h3'
import logger from "./logger"

// 成功返回
export const successAPI = <T>(data: T, msg = '查询成功', event?: H3Event): APIResponse<T> => {
  // 成功接口写入 info 日志
  if (event) {
    logger.info({
      url: event.node.req.url,
      message: msg
    }, "接口‑请求成功")
  }
  
  return {
    code: 200,
    data,
    msg
  }
}

// 失败返回
export const failAPI = (event: H3Event, msg: string): APIResponse<null> => {
  setResponseStatus(event, 400)

  // 写入错误日志：请求地址 + 错误提示
  logger.error({
    url: event.node.req.url
  },msg)

  return {
    code: 400,
    msg
  }
}
