import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationHistory {
  messages: ConversationMessage[];
  lastModified: number;
}

const STORAGE_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'conversation.json');

// 确保存储目录存在
const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

// 读取对话历史
const readHistory = (): ConversationHistory => {
  ensureStorageDir();
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    logger.error({ error }, 'Failed to read conversation history');
  }
  return { messages: [], lastModified: Date.now() };
};

// 写入对话历史
const writeHistory = (history: ConversationHistory): void => {
  ensureStorageDir();
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    logger.error({ error }, 'Failed to write conversation history');
  }
};

class ConversationHistoryService {
  /**
   * 获取对话历史
   */
  getHistory(): ConversationHistory {
    return readHistory();
  }

  /**
   * 添加消息到对话历史
   */
  addMessage(message: ConversationMessage): ConversationHistory {
    const history = readHistory();
    history.messages.push(message);
    history.lastModified = Date.now();
    writeHistory(history);
    return history;
  }

  /**
   * 批量添加消息
   */
  addMessages(messages: ConversationMessage[]): ConversationHistory {
    const history = readHistory();
    history.messages.push(...messages);
    history.lastModified = Date.now();
    writeHistory(history);
    return history;
  }

  /**
   * 清空对话历史
   */
  clearHistory(): ConversationHistory {
    const history: ConversationHistory = { messages: [], lastModified: Date.now() };
    writeHistory(history);
    return history;
  }

  /**
   * 获取消息数量
   */
  getMessageCount(): number {
    const history = readHistory();
    return history.messages.length;
  }
}

export const conversationHistoryService = new ConversationHistoryService();
