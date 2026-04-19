// TODO: Axios 实力配置
import axios, { type AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry' // TODO: 引入错误重试
import router from '@/router/index.js' // 引入 router
import { ElMessage, ElLoading } from 'element-plus' // elementplus的错误提示

// TODO: 基础准备
let loadingInstance // 请求的实例
let requestCount = 0 // 请求的次数
const pendingMap = new Map() // 存储每个请求的取消函数

// TODO: 生成请求的唯一标识（根据方法、url、参数、data）
const getRequestKey = (config):string => {
  const { method, url, params, data } = config // 解构出数据
  return [method, url, params, JSON.stringify(data)].join('&') // 合并成一个唯一标识的字符串
}

// TODO: 处理请求时的loading效果
// 显示loading
const showLoading = ():void => {
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

// 隐藏loading
const hideLoading = ():void => {
  requestCount--
  if (requestCount === 0 && loadingInstance) {
    loadingInstance.close() // 关闭弹窗
    loadingInstance = null // 清除实例，释放内存
  }
}

// TODO: 创建实例
const instance = axios.create({
  // TODO.1 基地址、超时时间
  baseURL: 'https://api.apiopen.top',
  timeout: 10000
})

// TODO: 错误后重试（利用第三方库axios-retry）
axiosRetry(instance, {
  retries: 3, // 最大重试次数
  retryDelay: (retryCount) => {
    console.log('网络错误，正在重试...')
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
    // config 是请求配置对象

    // 展示loading效果
    showLoading()

    // 处理重复请求
    const key = getRequestKey(config) // 得到标识
    // 如果有相同的请求正在进行就取消（第一次不会执行）
    if (pendingMap.has(key)) {
      const cancel = pendingMap.get(key)
      cancel('取消重复请求') // cancel是一个函数，属于Axios，用于取消正在进行的请求
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

    if (response.data?.code === 200 || response.data?.status === 0) return response.data.data
    // TODO.4 处理业务失败
    ElMessage.error(response.data.message || '服务失败')
    return Promise.reject(response.data) // 处理失败
  },
  function (error) {
    // 关闭弹窗
    hideLoading()

    // 如果是手动取消的请求，不弹出错误提示
    if (axios.isCancel(error)) {
      console.log('请求取消', error.message)
      return Promise.reject(error); // 注意这里要 reject，但不要触发错误弹窗
    }

    // 非取消错误，尝试从 pendingMap 移除
    if (error.config) {
      const key = getRequestKey(error.config)
      pendingMap.delete(key)
    }

    // TODO.5 处理401错误
    if (error.response?.status === 401) router.push('/login') // 错误的特殊情况 => 401：权限不足 或 token 过期 => 拦截到登录

    // 错误的默认情况 => 只要给提示就行
    ElMessage.error(
      error.response?.data?.message || error.message || '服务失败'
    )
    return Promise.reject(error)
  }
)

export default instance
