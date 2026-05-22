import { ref, watch, shallowRef } from 'vue'

/**
 * 通用请求 Hook
 * 适配项目中 axios 二次封装的接口函数
 * 自动管理 loading / data / error 状态
 * 支持自动请求、防抖、缓存等功能
 *
 * @param apiFunc - 基于 axios 封装的请求函数（返回 Promise）
 * @param options - 配置选项
 * @returns 响应式状态 + 执行函数
 */
export const useRequest = <T = any>(
  apiPromiseFunc: (...args: any[]) => Promise<T>,
  options: {
    autoRun?: boolean
    defaultParams?: any[]
    debounce?: number
    cache?: boolean
    cacheKey?: string
  } = {}
) => {
  const {
    autoRun = true,
    defaultParams = [],
    debounce = 0,
    cache = false,
    cacheKey = ''
  } = options

  const data = ref<T | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<Error | null>(null)
  const count = ref(0)

  const cacheMap = shallowRef<Map<string, T>>(new Map())
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const run = async (...args: any[]): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const requestArgs = args.length > 0 ? args : defaultParams
      const cacheKeyStr = cacheKey || JSON.stringify(requestArgs)

      // 检查缓存
      if (cache && cacheMap.value.has(cacheKeyStr)) {
        data.value = cacheMap.value.get(cacheKeyStr)!
        return data.value
      }

      const res = await apiPromiseFunc(...requestArgs)
      data.value = res

      // 缓存结果
      if (cache) {
        cacheMap.value.set(cacheKeyStr, res)
      }

      return res
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      return Promise.reject(err)
    } finally {
      loading.value = false
      count.value++
    }
  }

  const runDebounced = (...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    return new Promise<T>((resolve, reject) => {
      debounceTimer = setTimeout(async () => {
        try {
          const res = await run(...args)
          resolve(res)
        } catch (err) {
          reject(err)
        }
      }, debounce)
    })
  }

  const refresh = () => run()

  const cancelDebounce = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  // 自动执行请求
  if (autoRun) {
    run()
  }

  return {
    data,
    error,
    loading,
    count,
    run,
    runDebounced,
    refresh,
    cancelDebounce
  }
}

/**
 * GET 请求 Hook
 * 简化 GET 请求的使用
 */
export const useGet = <T = any>(
  apiFunc: (...args: any[]) => Promise<T>,
  params?: any[],
  options: Omit<Parameters<typeof useRequest>[1], 'defaultParams'> = {}
) => {
  return useRequest(apiFunc, {
    ...options,
    defaultParams: params || []
  })
}

/**
 * POST 请求 Hook
 * 简化 POST 请求的使用
 */
export const usePost = <T = any>(
  apiFunc: (...args: any[]) => Promise<T>,
  options: Omit<Parameters<typeof useRequest>[1], 'defaultParams'> = {}
) => {
  const { run, runDebounced, ...rest } = useRequest(apiFunc, {
    ...options,
    autoRun: false
  })

  return {
    ...rest,
    submit: run,
    submitDebounced: runDebounced
  }
}