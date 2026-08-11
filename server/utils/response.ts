import type { H3Event } from 'h3'

// 成功返回
export const successAPI = <T>(data: T, msg = '查询成功'): APIResponse<T> => {
  return {
    code: 200,
    data,
    msg
  }
}

// 失败返回
export const failAPI = (event: H3Event, msg: string): APIResponse<null> => {
  setResponseStatus(event, 400)
  return {
    code: 400,
    msg
  }
}
