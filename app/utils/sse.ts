// TODO: sse发消息处理
/*
  为什么 @microsoft/fetch-event-source 比原生 EventSource 强？
  企业项目必须用这个，原因如下：

  1. 原生 EventSource 只支持 GET
     ↓ 这个库支持 POST、PUT、DELETE
  2. 原生无法自定义请求头
     ↓ 这个库可以加 Authorization、Content‑Type
  3. 原生无法传 body
     ↓ 这个库可以传 JSON body
  4. 原生无法取消请求
     ↓ 这个库支持 AbortController
  5. 原生报错会自动重连，容易浪费 token
     ↓ 这个库可以手动控制重连
  6. 原生切 tab 会中断
     ↓ 这个库支持 openWhenHidden
  7. 原生不支持流式 JSON
     ↓ 这个库完美解析 SSE 数据流
  8. 企业级：稳定、可控、可调试、可监控

  总结：
  原生 = 玩具
  fetch‑event‑source = 生产级 SSE 标准
*/
import { fetchEventSource } from '@microsoft/fetch-event-source'

/*
  流式消息参数
*/
interface StreamChatParams {
  url: string
  messages?: Array<{ role: string; content: string }>
  modelName?: string
  conversationId?: number | null
  question?: string
  topK?: number
  onMessage: (content: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

/*
  StreamChat 类
  作用：封装流式对话 SSE 请求
  特点：单例、可取消、防重复
*/
class StreamChat {
  private abortController: AbortController | null = null

  /*
    发送流式消息（核心方法）
  */
  async chat(params: StreamChatParams) {
    const { url, messages, modelName, conversationId, question, topK, onMessage, onComplete, onError } = params

    this.abort()

    this.abortController = new AbortController()
    const signal = this.abortController.signal

    // 区分普通聊天 / RAG知识库请求的请求体
    let bodyData: Record<string, unknown>
    if (question) {
      // RAG 接口必须传递 messages，解决后端 messagesBody 不可迭代报错
      bodyData = { question, topK, messages, conversationId }
    } else {
      // 普通AI聊天接口
      bodyData = { messages, modelName, conversationId }
    }

    try {
      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify(bodyData),
        signal,
        openWhenHidden: true,

        onopen: async (response) => {
          if (!response.ok) throw new Error(`请求失败 ${response.status}`)
        },

        onmessage: (event) => {
          try {
            const data = JSON.parse(event.data)
            // 和后端字段 content 对齐，过滤空字符串分片
            if (data.content && data.content.trim() !== '') {
              // 只发送当前单块分片，前端负责拼接
              onMessage(data.content)
            } else if (data.error) {
              throw new Error(data.error || '未知错误')
            } else if (data.done) {
              onComplete()
            }
          } catch (e) {
            if (!data?.done) {
              console.warn('SSE parse error:', e)
            }
          }
        },

        onclose: () => {
          onComplete()
        },

        onerror: (err) => {
          if (signal.aborted) {
            return
          }
          console.error('SSE error:', err)
          onError(err as Error)
          throw err
        }
      })
    } catch (err) {
      if (!signal.aborted) {
        onError(err as Error)
      }
    }
  }

  // 取消请求
  abort() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

// 单例导出
export default new StreamChat()
