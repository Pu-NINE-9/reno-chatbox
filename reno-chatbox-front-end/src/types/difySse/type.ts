// TODO: Dify SSE 类型定义

// 发送对话消息的参数
export interface DifyStreamChatParams {
  message: string
  userId: string
  conversationId?: string
  inputs?: Record<string, any>

  // 回调
  onMessage: (data: { content: string; isLoading: boolean }) => void
  onComplete: (data: DifyCompleteData) => void
  onError: (err: Error) => void
}

// 完成回调的数据
export interface DifyCompleteData {
  answer: string
  conversationId: string
  messageId: string
  usage?: DifyUsage
}

// Token 使用量
export interface DifyUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

// SSE 消息类型
export interface DifySSEMessage {
  event: string
  task_id?: string
  message_id?: string
  conversation_id?: string
  answer?: string
  created_at?: number
  metadata?: {
    usage?: DifyUsage
  }
  id?: string
}

// 消息事件
export interface DifyMessageEvent {
  event: 'message' | 'agent_message'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

// 消息结束事件
export interface DifyMessageEndEvent {
  event: 'message_end'
  task_id: string
  message_id: string
  conversation_id: string
  metadata: {
    usage: DifyUsage
  }
}

// 文件事件
export interface DifyMessageFileEvent {
  event: 'message_file'
  id: string
  type: string
  belongs_to: 'user' | 'assistant'
  url: string
  conversation_id: string
}

// 工作流开始事件
export interface DifyWorkflowStartedEvent {
  event: 'workflow_started'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    created_at: number
  }
}

// 节点开始事件
export interface DifyNodeStartedEvent {
  event: 'node_started'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    node_type: string
    title: string
    index: number
    predecessor_node_id?: string
    inputs: Record<string, any>
    created_at: number
  }
}

// 节点结束事件
export interface DifyNodeFinishedEvent {
  event: 'node_finished'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    index: number
    predecessor_node_id?: string
    inputs: Record<string, any>
    process_data?: any
    outputs?: any
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    error?: string
    elapsed_time?: number
    execution_metadata?: any
    total_tokens?: number
    total_price?: number
    currency?: string
    created_at: number
  }
}

// 工作流结束事件
export interface DifyWorkflowFinishedEvent {
  event: 'workflow_finished'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    outputs: any
    error?: string
    elapsed_time: number
    total_tokens: number
    total_steps: number
    created_at: number
    finished_at: number
  }
}

// 聊天消息类型
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
  conversationId?: string
  messageId?: string
  usage?: DifyUsage
  suggestions?: { id: number; text: string }[]
  file?: {
    name: string
    size: string
    type: string
  }
}

// 会话类型
export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
  lastMessage?: string
}
