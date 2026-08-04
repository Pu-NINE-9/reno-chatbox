// 成功返回
export const successAPI = <T>(data: T, msg = '查询成功'): APIResponse<T> => {
  return {
    code: 200,
    data,
    msg
  }
}

// 失败返回
export const failAPI = (msg: string): APIResponse<null> => {
  return {
    code: 400,
    msg
  }
}
