import { Router, Request, Response } from 'express';
import { conversationHistoryService } from '../services/conversationHistoryService';
import { AppError } from '../middleware/errorHandler';

export const historyRoutes = Router();

// 获取对话历史
historyRoutes.get('/', (req: Request, res: Response) => {
  try {
    const history = conversationHistoryService.getHistory();
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation history',
    });
  }
});

// 清空对话历史
historyRoutes.delete('/', (req: Request, res: Response) => {
  try {
    const history = conversationHistoryService.clearHistory();
    res.json({
      success: true,
      data: history,
      message: 'Conversation history cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation history',
    });
  }
});

// 获取消息数量
historyRoutes.get('/count', (req: Request, res: Response) => {
  try {
    const count = conversationHistoryService.getMessageCount();
    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get message count',
    });
  }
});
