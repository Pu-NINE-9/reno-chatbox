interface DBConversation {
  id: number
  title: string
  modelName: string
  createdAt: string
  updatedAt: string
}

interface DBMsg {
  id: number
  conversationId: number
  role: string
  content: string
  createdAt: string
}

interface ConversationDetail {
  conversation: DBConversation
  messages: DBMsg[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: Array<{ type: 'text'; text: string }>
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<DBConversation[]>([])
  const currentConversationId = ref<number | null>(null)
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const streaming = ref(false)
  const skipSwitch = ref(false)

  const canSwitchConversation = computed(() => !loading.value && !streaming.value)

  async function fetchConversations() {
    try {
      const res = await $fetch<any>('/api/conversations')
      conversations.value = res?.data || []
    } catch (err) {
      console.error('获取对话列表失败:', err)
    }
  }

  async function createConversation(modelName: string): Promise<number | null> {
    try {
      const res = await $fetch<any>('/api/conversations', {
        method: 'POST',
        body: { modelName }
      })
      const data = res?.data
      if (data?.id) {
        skipSwitch.value = true
        await switchConversation(data.id)
        skipSwitch.value = false
        await fetchConversations()
        return data.id
      }
      return null
    } catch (err) {
      skipSwitch.value = false
      console.error('创建对话失败:', err)
      return null
    }
  }

  async function switchConversation(id: number) {
    try {
      loading.value = true
      const res = await $fetch<any>(`/api/conversations/${id}`)
      const data = res?.data as ConversationDetail | undefined
      if (data) {
        messages.value = data.messages.map((m) => ({
          id: String(m.id),
          role: m.role as 'user' | 'assistant',
          parts: [{ type: 'text', text: m.content }]
        }))
        currentConversationId.value = data.conversation.id
      }
    } catch (err) {
      console.error('加载对话失败:', err)
    } finally {
      loading.value = false
    }
  }

  async function deleteConversation(id: number) {
    try {
      await $fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      if (currentConversationId.value === id) {
        skipSwitch.value = true
        currentConversationId.value = null
        messages.value = []
        skipSwitch.value = false
      }
      await fetchConversations()
    } catch (err) {
      skipSwitch.value = false
      console.error('删除对话失败:', err)
    }
  }

  function setMessages(msgs: ChatMessage[]) {
    messages.value = msgs
  }

  function clearCurrentConversation() {
    skipSwitch.value = true
    currentConversationId.value = null
    messages.value = []
    skipSwitch.value = false
  }

  return {
    conversations,
    currentConversationId,
    messages,
    loading,
    streaming,
    skipSwitch,
    canSwitchConversation,
    fetchConversations,
    createConversation,
    switchConversation,
    deleteConversation,
    setMessages,
    clearCurrentConversation
  }
}, {
  persist: {
    pick: ['currentConversationId']
  }
})
