import { ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain' // 导入agent相关API
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
// 导入你写好的时间工具
import { getCurrentTime, webSearch } from "./tools"

const config = useRuntimeConfig()

function createModel(modelName: string) {
  console.log('[Model] 创建实例 → modelName:', modelName, 'baseURL:', config.ai.baseURL)
  return new ChatOpenAI({
    apiKey: config.ai.apiKey,
    modelName,
    configuration: {
      baseURL: config.ai.baseURL
    },
    timeout: 60000, // 开启延时
    verbose: true // 开启langchain内部详细日志，打印完整请求和响应
  })
}

function buildMessages(messages: Array<{ role: string; content: string }>): BaseMessage[] {
  const langchainMessages: BaseMessage[] = [new SystemMessage(config.ai.systemPromptText)]

  for (const msg of messages) {
    if (msg.role === 'user') {
      langchainMessages.push(new HumanMessage(msg.content))
    } else if (msg.role === 'assistant') {
      langchainMessages.push(new AIMessage(msg.content))
    }
  }

  return langchainMessages
}

// 注册所有可用工具
const tools = [getCurrentTime, webSearch]

/**
 * 同步对话入口
 * createAgent：LangChain‑JS v1 全新顶层Agent，替代废弃的 AgentExecutor
 */
export async function invokeChat(messages: Array<{ role: string; content: string }>, modelName: string) {
  const model = createModel(modelName)

  // 创建智能代理，自动处理：思考 → 调用工具 → 带回结果 → 生成回答
  const agent = createAgent({
    model,
    tools,
    systemPrompt: config.ai.systemPromptText
  })

  const history = buildMessages(messages)
  // 执行agent
  const res = await agent.invoke({
    messages: history
  })

  // 返回最终AI输出文本
  return res.messages.at(-1)?.content
}

/**
 * 流式函数，函数名依旧为 streamChat，后端SSE接口无需修改
 * Agent完整走完工具调用流程后，再分片向前端输出文字
 */
export async function* streamChat(messages: Array<{ role: string; content: string }>, modelName: string) {
  const finalText = await invokeChat(messages, modelName)
  if (!finalText) return

  // 逐字符流式返回
  for (const char of finalText) if (char !== "") yield char
}
