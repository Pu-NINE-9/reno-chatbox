<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const messages = ref([
  {
    id: 1,
    role: 'system',
    content: t('chat.welcome'),
    time: '10:23',
    suggestions: [
      { id: 1, text: t('chat.suggestion1') },
      { id: 2, text: t('chat.suggestion2') },
      { id: 3, text: t('chat.suggestion3') },
      { id: 4, text: t('chat.suggestion4') },
    ],
  },
  {
    id: 2,
    role: 'user',
    content: t('chat.userMessage'),
    time: '10:23',
  },
  {
    id: 3,
    role: 'assistant',
    content: t('chat.assistantMessage'),
    time: '10:24',
  },
])

const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const newMessage = {
    id: messages.value.length + 1,
    role: 'user',
    content: inputMessage.value.trim(),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }

  messages.value.push(newMessage)
  inputMessage.value = ''
  await scrollToBottom()

  isLoading.value = true

  setTimeout(() => {
    const response = {
      id: messages.value.length + 1,
      role: 'assistant',
      content: t('chat.responseMessage'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    messages.value.push(response)
    isLoading.value = false
    scrollToBottom()
  }, 1500)
}

const handleSuggestion = (text: string) => {
  inputMessage.value = text
}
</script>

<template>
  <div class="h-full flex flex-col bg-[var(--bg-color)]">
    <!-- 头部 -->
    <header
      class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg bg-[var(--primary-color)] flex items-center justify-center"
        >
          <span class="text-white font-bold">A</span>
        </div>
        <div>
          <h2 class="font-medium text-[var(--text-color)]">{{ t('chat.title') }}</h2>
          <p class="text-xs text-[var(--text-secondary)]">{{ t('chat.subtitle') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <select
          class="px-3 py-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o mini</option>
          <option value="claude">Claude 3</option>
        </select>
        <button class="p-2 hover:bg-[var(--border-color)]/50 rounded-lg transition-colors">
          <svg
            class="w-5 h-5 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      </div>
    </header>

    <!-- 消息区域 -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex gap-3 w-full',
          message.role === 'user' ? 'flex-row-reverse justify-end' : 'justify-start',
        ]"
      >
        <!-- 头像 -->
        <div
          :class="[
            'w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center',
            message.role === 'user' ? 'bg-[var(--primary-color)]' : 'bg-[var(--border-color)]',
          ]"
        >
          <svg
            v-if="message.role === 'system'"
            class="w-5 h-5 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span v-else-if="message.role === 'user'" class="text-white text-sm font-medium">U</span>
          <svg
            v-else
            class="w-5 h-5 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        <!-- 消息内容 -->
        <div :class="['max-w-[70%]', message.role === 'user' ? 'text-right ml-auto' : 'text-left']">
          <div
            :class="[
              'inline-block px-4 py-3 rounded-xl',
              message.role === 'user'
                ? 'bg-[var(--primary-color)] text-white rounded-tr-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-tl-sm',
            ]"
          >
            <p
              :class="[
                'text-sm leading-relaxed',
                message.role === 'user' ? 'text-white' : 'text-[var(--text-color)]',
              ]"
            >
              {{ message.content }}
            </p>
          </div>
          <span class="text-xs text-[var(--text-secondary)] mt-1 block">{{ message.time }}</span>

          <!-- 建议标签 -->
          <div v-if="message.suggestions" class="flex flex-wrap gap-2 mt-3 justify-start">
            <button
              v-for="suggestion in message.suggestions"
              :key="suggestion.id"
              @click="handleSuggestion(suggestion.text)"
              class="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-xs text-[var(--text-secondary)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"
            >
              {{ suggestion.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex gap-3 justify-start">
        <div class="w-10 h-10 rounded-lg bg-[var(--border-color)] flex items-center justify-center">
          <svg
            class="w-5 h-5 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div
          class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 rounded-tl-sm"
        >
          <div class="flex gap-1">
            <span
              class="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce"
              style="animation-delay: 0ms"
            ></span>
            <span
              class="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></span>
            <span
              class="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="border-t border-[var(--border-color)] p-4 bg-[var(--bg-card)]">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-3">
          <button class="p-2 hover:bg-[var(--border-color)]/50 rounded-lg transition-colors">
            <svg
              class="w-5 h-5 text-[var(--text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
          <div class="flex-1 relative">
            <textarea
              v-model="inputMessage"
              @keydown.enter.exact.prevent="sendMessage"
              placeholder="Type your message..."
              class="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-color)] placeholder-[var(--text-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
              rows="2"
            ></textarea>
            <div
              class="absolute right-3 bottom-3 flex items-center gap-1 text-xs text-[var(--text-secondary)]"
            >
              <span>Enter</span>
              <span>发送</span>
              <span class="mx-1">|</span>
              <span>Shift+Enter</span>
              <span>换行</span>
            </div>
          </div>
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isLoading"
            :class="[
              'p-3 rounded-xl transition-all duration-200',
              inputMessage.trim() && !isLoading
                ? 'bg-[var(--primary-color)] text-white hover:opacity-90'
                : 'bg-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed',
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <div class="flex items-center justify-center gap-4 mt-3">
          <button
            class="text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
          >
            {{ t('chat.quickWrite') }}
          </button>
          <span class="text-[var(--border-color)]">|</span>
          <button
            class="text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
          >
            {{ t('chat.continueWriting') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
