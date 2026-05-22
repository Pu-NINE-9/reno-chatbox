import { ChatDeepSeek } from '@langchain/deepseek';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { logger } from '../utils/logger';

let model: ChatDeepSeek | null = null;
let modelInitializationAttempted = false;

const getModel = (): ChatDeepSeek => {
  if (model) return model;
  if (modelInitializationAttempted) {
    throw new Error('ChatDeepSeek model failed to initialize');
  }
  modelInitializationAttempted = true;

  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey) {
    throw new Error('DEEPSEEK_API_KEY not found in environment variables');
  }

  model = new ChatDeepSeek({
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 4096,
    apiKey: deepseekApiKey,
  });

  return model;
};

const stringOutputParser = new StringOutputParser();

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const defaultSystemPrompt = `你是一个专业的编程助手。请使用 Markdown 格式回答问题。

当输出代码时，请使用代码块格式，例如：
\`\`\`c
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

请确保代码块包含正确的语言标识，并且代码格式正确。`;

class ChatService {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { messages, temperature = 0.7, maxTokens = 4096 } = request;

    try {
      const modelWithConfig = getModel().bind({
        temperature,
        max_tokens: maxTokens,
      });

      // 构建消息列表
      const systemMessage = messages.find(m => m.role === 'system');
      const chatHistory = messages.filter(m => m.role !== 'system');

      const formattedMessages = [
        { role: 'system' as const, content: systemMessage?.content || defaultSystemPrompt },
        ...chatHistory.map(m => ({ role: m.role, content: m.content })),
      ];

      // 使用 LCEL 管道，直接传入消息数组
      const chain = modelWithConfig.pipe(stringOutputParser);
      const content = await chain.invoke(formattedMessages);

      return {
        content,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Chat service error');
      throw error;
    }
  }

  async chatWithRag(retrievedDocs: string[], question: string, systemPrompt?: string): Promise<ChatResponse> {
    const context = retrievedDocs.join('\n\n');
    const messages: ChatMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      {
        role: 'user' as const,
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ];

    return this.chat({ messages });
  }
}

export const chatService = new ChatService();
