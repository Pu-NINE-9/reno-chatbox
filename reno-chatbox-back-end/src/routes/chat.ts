import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chatService, ChatMessage } from '../services/chatService';
import { ragService } from '../services/ragService';
import { conversationHistoryService } from '../services/conversationHistoryService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const chatRoutes = Router();

const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(8192).optional().default(4096),
  useRag: z.boolean().optional().default(false),
  ragTopK: z.number().min(1).max(20).optional().default(5),
});

chatRoutes.post('/', async (req: Request, res: Response, next) => {
  try {
    const validation = ChatRequestSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, 'Invalid request body', 'VALIDATION_ERROR');
    }

    const { messages, temperature, maxTokens, useRag, ragTopK } = validation.data;

    let contextDocs: string[] = [];
    if (useRag) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        contextDocs = await ragService.retrieve(lastUserMessage.content, ragTopK);
        logger.info({ query: lastUserMessage.content, docCount: contextDocs.length }, 'RAG retrieval done');
      }
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const effectiveMessages: ChatMessage[] = useRag && contextDocs.length > 0
      ? [
          ...(systemMessage ? [systemMessage] : []),
          {
            role: 'system' as const,
            content: `You are a helpful assistant. Use the following context to answer the user's question if relevant.\n\nContext:\n${contextDocs.join('\n\n')}`,
          },
          ...messages.filter(m => m.role !== 'system'),
        ]
      : messages;

    const response = await chatService.chat({
      messages: effectiveMessages,
      temperature,
      maxTokens,
    });

    // 保存对话历史
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg) {
      conversationHistoryService.addMessage({
        role: 'user',
        content: lastUserMsg.content,
        timestamp: Date.now(),
      });
    }
    conversationHistoryService.addMessage({
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      data: response,
      ragUsed: useRag,
      contextDocsCount: contextDocs.length,
    });
  } catch (error) {
    next(error);
  }
});

chatRoutes.post('/stream', async (req: Request, res: Response, next) => {
  try {
    const validation = ChatRequestSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, 'Invalid request body', 'VALIDATION_ERROR');
    }

    const { messages, temperature, maxTokens, useRag, ragTopK } = validation.data;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // 添加 RAG 支持
    let contextDocs: string[] = [];
    if (useRag) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        contextDocs = await ragService.retrieve(lastUserMessage.content, ragTopK);
        logger.info({ query: lastUserMessage.content, docCount: contextDocs.length }, 'RAG retrieval done');
      }
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const effectiveMessages: ChatMessage[] = useRag && contextDocs.length > 0
      ? [
          ...(systemMessage ? [systemMessage] : []),
          {
            role: 'system' as const,
            content: `You are a helpful assistant. Use the following context to answer the user's question if relevant.\n\nContext:\n${contextDocs.join('\n\n')}`,
          },
          ...messages.filter(m => m.role !== 'system'),
        ]
      : messages;

    // 保存用户消息到历史
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg) {
      conversationHistoryService.addMessage({
        role: 'user',
        content: lastUserMsg.content,
        timestamp: Date.now(),
      });
    }

    try {
      const response = await chatService.chat({
        messages: effectiveMessages,
        temperature,
        maxTokens,
      });

      // 保存助手响应到历史
      conversationHistoryService.addMessage({
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      });

      // 以流的方式逐字符发送响应
      const content = response.content;
      let index = 0;

      const sendChunk = () => {
        if (index < content.length) {
          // 每次发送几个字符
          const chunkSize = Math.min(5, content.length - index);
          const chunk = content.slice(index, index + chunkSize);
          res.write(`data: ${chunk}\n\n`);
          index += chunkSize;
          setTimeout(sendChunk, 50);
        } else {
          res.end();
        }
      };

      sendChunk();
    } catch (error) {
      logger.error({ error }, 'Stream error');
      res.write(`data: 抱歉，发送消息失败，请稍后重试。\n\n`);
      res.end();
    }
  } catch (error) {
    next(error);
  }
});
