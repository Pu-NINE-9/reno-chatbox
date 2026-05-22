import { request } from '@/utils'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  useRag?: boolean
  ragTopK?: number
}

export interface ChatResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface FileInfo {
  id: string
  fileName: string
  fileType: string
  chunkCount: number
  fileSize: number
  uploadTime: string
}

export interface RetrieveResult {
  query: string
  results: string[]
  count: number
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ConversationHistory {
  messages: ConversationMessage[]
  lastModified: number
}

export interface ParseRequest {
  type: 'json' | 'xml' | 'csv' | 'markdown' | 'plain'
  data: string
  options?: {
    strict?: boolean
    fields?: string[]
  }
}

export const chatAPI = {
  sendMessage: (params: ChatRequest) => request.post('/api/chat', params),

  streamMessage: (params: ChatRequest) => request.post('/api/chat/stream', params),
}

export const ragAPI = {
  uploadFile: (formData: FormData) => request.post('/api/rag/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  listFiles: () => request.get('/api/rag/files'),

  getFileInfo: (fileId: string) => request.get(`/api/rag/files/${fileId}`),

  deleteFile: (fileId: string) => request.delete(`/api/rag/files/${fileId}`),

  retrieve: (query: string, topK?: number) => request.post('/api/rag/retrieve', { query, topK }),

  getStats: () => request.get('/api/rag/stats'),

  saveIndex: (filePath: string) => request.post('/api/rag/save', { filePath }),

  loadIndex: (filePath: string) => request.post('/api/rag/load', { filePath }),
}

export const parseAPI = {
  parse: (params: ParseRequest) => request.post('/api/parse', params),

  validate: (type: string, data: string) => request.post('/api/parse/validate', { type, data }),

  batchParse: (items: ParseRequest[]) => request.post('/api/parse/batch', { items }),
}

export const healthAPI = {
  check: () => request.get('/health'),
}

export const historyAPI = {
  getHistory: () => request.get('/api/history'),

  clearHistory: () => request.delete('/api/history'),

  getCount: () => request.get('/api/history/count'),
}
