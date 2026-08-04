import { ChatDeepSeek } from '@langchain/deepseek'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

const config = useRuntimeConfig()

const model = new ChatDeepSeek({
  apiKey: config.ai.apiKey,
  modelName: config.ai.modelName,
  timeout: 60000, // 延长超时
  verbose: true // 开启langchain内部详细日志，打印完整请求和响应
})

const parser = new StringOutputParser()

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

export async function invokeChat(messages: Array<{ role: string; content: string }>) {
  const langchainMessages = buildMessages(messages)
  const chain = model.pipe(parser)
  const response = await chain.invoke(langchainMessages)
  return response
}

export async function* streamChat(messages: Array<{ role: string; content: string }>) {
  const langchainMessages = buildMessages(messages)
  const chain = model.pipe(parser)
  const stream = await chain.stream(langchainMessages)

  for await (const chunk of stream) {
    if (chunk) {
      yield chunk
    }
  }
}
