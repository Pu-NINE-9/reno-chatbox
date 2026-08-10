import { ChatOpenAI } from '@langchain/openai'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

const config = useRuntimeConfig()

const parser = new StringOutputParser()

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

export async function invokeChat(messages: Array<{ role: string; content: string }>, modelName: string) {
  const model = createModel(modelName)
  const langchainMessages = buildMessages(messages)
  const chain = model.pipe(parser)
  const response = await chain.invoke(langchainMessages)
  return response
}

export async function* streamChat(messages: Array<{ role: string; content: string }>, modelName: string) {
  const model = createModel(modelName)
  const langchainMessages = buildMessages(messages)
  const chain = model.pipe(parser)
  const stream = await chain.stream(langchainMessages)

  for await (const chunk of stream) {
    if (chunk) {
      yield chunk
    }
  }
}
