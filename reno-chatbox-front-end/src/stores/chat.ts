import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage, Conversation } from '@/types'
import { chatAPI, ragAPI } from '@/api'
import streamChat from '@/utils/difySse'

const STORAGE_KEY = 'reno_chat_conversations'

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useChatStore = defineStore('chat', () => {
  const currentConversationId = ref<string>('')
  const userId = ref<string>('user_' + Date.now())
  const conversations = ref<Conversation[]>([])
  const currentMessages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const useRag = ref(true)

  const currentConversation = computed(() =>
    conversations.value.find((c) => c.id === currentConversationId.value),
  )

  const loadConversations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        conversations.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('加载会话失败:', err)
      conversations.value = []
    }
  }

  const saveConversations = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
    } catch (err) {
      console.error('保存会话失败:', err)
    }
  }

  const createNewConversation = (): string => {
    const id = generateUUID()
    const now = new Date().toISOString()

    const newConversation: Conversation = {
      id,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messages: [],
    }

    conversations.value.unshift(newConversation)
    currentConversationId.value = id
    currentMessages.value = []
    saveConversations()

    return id
  }

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (conversation) {
      currentConversationId.value = conversationId
      currentMessages.value = [...conversation.messages]
    }
  }

  const addMessage = (message: ChatMessage) => {
    currentMessages.value.push(message)

    if (currentConversationId.value) {
      const conversation = conversations.value.find((c) => c.id === currentConversationId.value)
      if (conversation) {
        conversation.messages = [...currentMessages.value]
        conversation.updatedAt = new Date().toISOString()

        if (message.role === 'user' && conversation.title === '新对话') {
          conversation.title =
            message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
        }

        conversation.lastMessage = message.content.slice(0, 50)

        saveConversations()
      }
    }
  }

  const updateLastAssistantMessage = (content: string, messageId?: string, usage?: any) => {
    const lastIndex = currentMessages.value.length - 1
    const lastMessage = currentMessages.value[lastIndex]
    if (lastIndex >= 0 && lastMessage && lastMessage.role === 'assistant') {
      const updatedMessage: ChatMessage = {
        ...lastMessage,
        content,
      }
      if (messageId) {
        updatedMessage.messageId = messageId
      }
      if (usage) {
        updatedMessage.usage = usage
      }
      currentMessages.value = [...currentMessages.value.slice(0, lastIndex), updatedMessage]

      if (currentConversationId.value) {
        const conversation = conversations.value.find((c) => c.id === currentConversationId.value)
        if (conversation) {
          conversation.messages = [...currentMessages.value]
          conversation.updatedAt = new Date().toISOString()
          conversation.lastMessage = content.slice(0, 50)
          saveConversations()
        }
      }
    }
  }

  const deleteConversation = (conversationId: string) => {
    const index = conversations.value.findIndex((c) => c.id === conversationId)
    if (index > -1) {
      conversations.value.splice(index, 1)
      saveConversations()

      if (currentConversationId.value === conversationId) {
        currentConversationId.value = ''
        currentMessages.value = []
      }
    }
  }

  const clearAllConversations = () => {
    conversations.value = []
    currentConversationId.value = ''
    currentMessages.value = []
    saveConversations()
  }

  const sendMessage = async (content: string): Promise<void> => {
    isLoading.value = true

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content,
      time: new Date().toISOString(),
    }
    addMessage(userMessage)

    // 创建一个空的助手消息用于流式更新
    const assistantMessageId = generateUUID()
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      time: new Date().toISOString(),
    }
    addMessage(assistantMessage)

    const messages: { role: string; content: string }[] = currentMessages.value.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      await streamChat.chat({
        message: content,
        messages,
        useRag: useRag.value,
        onMessage: ({ content: partialContent, isLoading: isStreaming }) => {
          updateLastAssistantMessage(partialContent)
        },
        onComplete: ({ answer }) => {
          updateLastAssistantMessage(answer)
        },
        onError: (error) => {
          console.error('流式消息错误:', error)
          updateLastAssistantMessage('抱歉，发送消息失败，请稍后重试。')
        },
      })
    } catch (error) {
      console.error('发送消息失败:', error)
      updateLastAssistantMessage('抱歉，发送消息失败，请稍后重试。')
    } finally {
      isLoading.value = false
    }
  }

  const toggleRag = (enabled: boolean) => {
    useRag.value = enabled
  }

  const uploadFileToRag = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await ragAPI.uploadFile(formData) as unknown as { fileName: string; chunkCount: number }
      return { success: true, message: `文件上传成功：${response.fileName}，已分成 ${response.chunkCount} 个片段` }
    } catch (error) {
      console.error('文件上传失败:', error)
      return { success: false, message: '文件上传失败，请稍后重试' }
    }
  }

  const listRagFiles = async () => {
    try {
      return await ragAPI.listFiles() as unknown as Array<{ id: string; fileName: string; fileSize: number; uploadTime: string }>
    } catch (error) {
      console.error('获取文件列表失败:', error)
      return []
    }
  }

  const deleteRagFile = async (fileId: string): Promise<boolean> => {
    try {
      await ragAPI.deleteFile(fileId)
      return true
    } catch (error) {
      console.error('删除文件失败:', error)
      return false
    }
  }

  loadConversations()

  return {
    currentConversationId,
    userId,
    conversations,
    currentMessages,
    currentConversation,
    isLoading,
    useRag,
    createNewConversation,
    switchConversation,
    addMessage,
    updateLastAssistantMessage,
    deleteConversation,
    clearAllConversations,
    loadConversations,
    saveConversations,
    sendMessage,
    toggleRag,
    uploadFileToRag,
    listRagFiles,
    deleteRagFile,
  }
})
