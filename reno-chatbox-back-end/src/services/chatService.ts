import { ChatDeepSeek } from '@langchain/deepseek';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
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

class ChatService {
  private createPrompt(messages: ChatMessage[]) {
    const systemMessage = messages.find(m => m.role === 'system');
    const chatHistory = messages.filter(m => m.role !== 'system');

    const prompt = ChatPromptTemplate.fromMessages([
      ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
      ...chatHistory.map(m => ({ role: m.role, content: m.content })),
    ]);

    return prompt;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { messages, temperature = 0.7, maxTokens = 4096 } = request;

    try {
      const modelWithConfig = getModel().bind({
        temperature,
        max_tokens: maxTokens,
      });

      const chain = this.createPrompt(messages).pipe(modelWithConfig).pipe(stringOutputParser);
      const content = await chain.invoke({});

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
