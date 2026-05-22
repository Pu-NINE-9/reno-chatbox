// TODO: sse发消息处理
/*
  为什么 @microsoft/fetch-event-source 比原生 EventSource 强？
  企业项目必须用这个，原因如下：

  1. 原生 EventSource 只支持 GET
     ↓ 这个库支持 POST、PUT、DELETE
  2. 原生无法自定义请求头
     ↓ 这个库可以加 Authorization、Content-Type
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
  fetch-event-source = 生产级 SSE 标准
*/
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { encrypt } from '@/utils/crypto'

/*
  流式消息参数
*/
interface StreamChatParams {
  message: string
  messages: Array<{ role: string; content: string }>
  useRag?: boolean
  onMessage: (data: { content: string; isLoading: boolean }) => void
  onComplete: (data: { answer: string }) => void
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
    const { message, messages, useRag = false, onMessage, onComplete, onError } = params

    this.abort()

    this.abortController = new AbortController()
    const signal = this.abortController.signal

    let fullAnswer = ''

    try {
      const requestBody = JSON.stringify({
        messages: [...messages, { role: 'user', content: message }],
        temperature: 0.7,
        maxTokens: 4096,
        useRag,
        ragTopK: 5,
      })

      const encryptedBody = encrypt(requestBody)

      await fetchEventSource(import.meta.env.VITE_API_URL + '/api/chat/stream', {
        method: 'POST',
        headers: {
          'x-api-key': btoa(import.meta.env.VITE_API_KEY || ''),
          'Content-Type': 'application/json',
          'X-Encrypted': 'true',
        },
        body: JSON.stringify({ payload: encryptedBody }),
        signal,
        openWhenHidden: true,
        credentials: 'omit',

        onopen: async (response) => {
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`请求失败 ${response.status}: ${errorText}`)
          }
          return Promise.resolve()
        },

        onmessage: (event) => {
          try {
            if (!event.data) return

            // 后端返回的是纯文本流（token by token）
            fullAnswer += event.data
            onMessage({ content: fullAnswer, isLoading: true })
          } catch (err) {
            console.warn('解析 SSE 消息失败', err)
          }
        },

        onclose: () => {
          // 连接关闭表示消息发送完成
          onMessage({ content: fullAnswer, isLoading: false })
          onComplete({ answer: fullAnswer })
        },

        onerror: (err) => {
          console.error('SSE 错误', err)
          onError(err as Error)
          throw err
        },
      })
    } catch (err) {
      onError(err as Error)
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
