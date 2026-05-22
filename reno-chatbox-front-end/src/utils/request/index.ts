// TODO: Axios 实例配置
import axios, { type AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry' // TODO: 引入错误重试
import router from '@/router/index.js' // 引入 router
import { ElMessage, ElLoading } from 'element-plus' // elementplus的错误提示
import { encryptRequest } from '@/utils/crypto'

// TODO: 基础准备
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null
let requestCount = 0 // 请求的次数
const pendingMap = new Map() // 存储每个请求的取消函数

// TODO: 生成请求的唯一标识（根据方法、url、参数、data）
const getRequestKey = (config: any): string => {
  const { method, url, params, data } = config // 解构出数据
  return [method, url, params, JSON.stringify(data)].join('&') // 合并成一个唯一标识的字符串
}

// TODO: 处理请求时的loading效果
const showLoading = (): void => {
  if (requestCount === 0) {
    // 配置elloading实例
    loadingInstance = ElLoading.service({
      fullscreen: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  requestCount++
}

const hideLoading = (): void => {
  requestCount--
  if (requestCount === 0 && loadingInstance) {
    loadingInstance.close() // 关闭弹窗
    loadingInstance = null // 清除实例，释放内存
  }
}

// TODO: 创建实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000
})

// TODO: 错误后重试
axiosRetry(instance, {
  retries: 3, // 最大重试次数
  retryDelay: (retryCount) => {
    if (retryCount == 1) ElMessage.warning('网络不稳定，正在重新连接中...')
    return retryCount * 1000 // 重试延迟，1s到3秒
  },
  // TODO: 只有网络错误或5xx服务端错误才重试
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
  (error.response?.status ?? 0) >= 500
})

// TODO: 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    showLoading()

    // 加密 API Key（使用 Base64 编码）
    const apiKey = import.meta.env.VITE_API_KEY
    if (apiKey) {
      config.headers['x-api-key'] = btoa(apiKey) // Base64 编码
    }

    // 加密请求体（除了流式请求和文件上传）
    if (config.data && !config.url?.includes('/stream') && !(config.data instanceof FormData)) {
      try {
        const encrypted = encryptRequest(config.data)
        config.data = encrypted
      } catch (error) {
        console.error('请求加密失败:', error)
      }
    }

    // 处理重复请求
    const key = getRequestKey(config) // 得到标识
    // 如果有相同的请求正在进行就取消（第一次不会执行）
    if (pendingMap.has(key)) {
      const cancel = pendingMap.get(key)
      cancel('取消重复请求')
      pendingMap.delete(key)
    }

    // 创建新的取消令牌（即在map里面为每个键值对添加一个专属的cancel函数用于取消请求）
    config.cancelToken = new axios.CancelToken(cancel => pendingMap.set(key, cancel)) // CancelToken是Axios提供的一个工具，用于创建可取消的请求
    return config
  },
  (err) => Promise.reject(err)
)

// TODO: 添加响应拦截器
instance.interceptors.response.use(
  function (response: AxiosResponse) {
    // 隐藏loading效果
    hideLoading()

    // 移除已完成的请求
    const key = getRequestKey(response.config)
    pendingMap.delete(key)

    if (response.data?.success === true) return response.data.data
    if (response.data?.success === false) {
      ElMessage.error(response.data.error || '服务失败')
      return Promise.reject(response.data)
    }
    return response.data
  },
  function (error) {
    hideLoading()

    if (axios.isCancel(error)) {
      return Promise.reject(error); // 注意这里要 reject，但不要触发错误弹窗
    }

    // 非取消错误，尝试从 pendingMap 移除
    if (error.config) {
      const key = getRequestKey(error.config)
      pendingMap.delete(key)
    }

    if (error.response?.status === 401) {
      ElMessage.error('未授权，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('API 密钥无效')
    }

    ElMessage.error(
      error.response?.data?.error || error.message || '服务失败'
    )
    return Promise.reject(error)
  }
)

export default instance
