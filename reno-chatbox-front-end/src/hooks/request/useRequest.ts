// TODO: 请求钩子

/**
 * 通用请求 Hook
 * 适配项目中 axios 二次封装的接口函数
 * 自动管理 loading / data / error 状态
 *
 * @param apiFunc - 基于 axios 封装的请求函数（返回 Promise）
 * @returns 响应式状态 + 执行函数
 * @returns data - 接口返回的数据响应式对象，初始为 null
 * @returns loading - 请求加载中的响应式状态
 * @returns error - 请求失败的错误信息
 * @returns run - 执行接口请求的方法，传参会自动透传给 apiFunc
 */
export const useRequest = <T = any>(apiPromiseFunc: (...args: any[]) => Promise<T>) => {
  const data = ref<T | null>(null) // 接口返回数据
  const loading = ref<boolean>(false) // 加载状态
  const error = ref<Error | null>(null) // 错误信息

  /**
   * 执行请求
   * @param args - 传给接口的参数
   * @returns res - 解构出来的结果
   */
  const run = async (...args: any[]): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const res = await apiPromiseFunc(...args)
      data.value = res
      return res
    } catch (err) {
      error.value =  err instanceof Error ? err : new Error(String(err))
      return Promise.reject(err)
    } finally {
      loading.value = false
    }
  }

  return {
    data, // 响应数据
    error, // 错误
    loading, // 加载状态
    run // 执行函数
  }
}
