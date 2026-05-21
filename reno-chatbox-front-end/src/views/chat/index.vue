<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import type { ChatMessage } from '@/types'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer.vue'

const { t } = useI18n()
const chatStore = useChatStore()

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'md', 'csv']
const MAX_FILE_SIZE = 50 * 1024 * 1024

const isDragging = ref(false)
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const showFileUploadModal = ref(false)
const ragFiles = ref<{ id: string; fileName: string; fileSize: number; uploadTime: string }[]>([])

const messages = computed(() => chatStore.currentMessages)
const isLoading = computed(() => chatStore.isLoading)
const ragEnabled = computed(() => chatStore.useRag)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  if (!chatStore.currentConversationId) {
    chatStore.createNewConversation()
  }

  const queryText = inputMessage.value.trim()
  inputMessage.value = ''

  await chatStore.sendMessage(queryText)
  await scrollToBottom()
}

const handleSuggestion = (text: string) => {
  inputMessage.value = text
}

const isFileTypeAllowed = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension ? ALLOWED_EXTENSIONS.includes(extension) : false
}

const isFileSizeAllowed = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  if (
    e.clientX <= rect.left ||
    e.clientX >= rect.right ||
    e.clientY <= rect.top ||
    e.clientY >= rect.bottom
  ) {
    isDragging.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file) continue

    if (!isFileTypeAllowed(file)) {
      alert(`文件 "${file.name}" 类型不允许！\n允许的类型: ${ALLOWED_EXTENSIONS.join(', ')}`)
      continue
    }

    if (!isFileSizeAllowed(file)) {
      alert(
        `文件 "${file.name}" 超过大小限制！\n最大允许: ${formatFileSize(MAX_FILE_SIZE)}，当前: ${formatFileSize(file.size)}`,
      )
      continue
    }

    await uploadFile(file)
  }
}

const uploadFile = async (file: File) => {
  const result = await chatStore.uploadFileToRag(file)
  if (result.success) {
    alert(result.message)
    await loadRagFiles()
  } else {
    alert(result.message)
  }
}

const loadRagFiles = async () => {
  ragFiles.value = await chatStore.listRagFiles()
}

const deleteRagFile = async (fileId: string) => {
  if (!confirm('确定要删除这个文件吗？')) return
  const success = await chatStore.deleteRagFile(fileId)
  if (success) {
    await loadRagFiles()
  }
}

const toggleRag = () => {
  chatStore.toggleRag(!ragEnabled.value)
}

onMounted(() => {
  if (messages.value.length === 0) {
    const welcomeMessage: ChatMessage = {
      id: 'msg_welcome',
      role: 'system',
      content: t('chat.welcome'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        { id: 1, text: t('chat.suggestion1') },
        { id: 2, text: t('chat.suggestion2') },
        { id: 3, text: t('chat.suggestion3') },
        { id: 4, text: t('chat.suggestion4') },
      ],
    }
    chatStore.addMessage(welcomeMessage)
  }
  scrollToBottom()
})
</script>

<template>
  <div
    class="h-full flex flex-col bg-[var(--bg-color)]"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <transition name="fade">
      <div
        v-if="isDragging"
        class="fixed inset-0 bg-[var(--primary-color)]/10 border-4 border-dashed border-[var(--primary-color)] rounded-2xl z-50 flex items-center justify-center"
      >
        <div class="text-center">
          <svg
            class="w-16 h-16 text-[var(--primary-color)] mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="text-[var(--text-color)] text-lg font-medium">释放文件以上传到知识库</p>
        </div>
      </div>
    </transition>

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
      <div class="flex items-center gap-3">
        <button
          @click="toggleRag"
          :class="[
            'px-3 py-2 rounded-lg text-sm transition-all',
            ragEnabled
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-[var(--border-color)]/50 text-[var(--text-secondary)]',
          ]"
        >
          {{ ragEnabled ? 'RAG 已启用' : 'RAG 已关闭' }}
        </button>
        <button
          @click="showFileUploadModal = true"
          class="px-3 py-2 bg-[var(--border-color)]/50 text-[var(--text-color)] rounded-lg text-sm hover:bg-[var(--border-color)] transition-colors"
        >
          知识库文件
        </button>
        <button
          @click="chatStore.createNewConversation"
          class="px-3 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          新对话
        </button>
      </div>
    </header>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex gap-3 w-full',
          message.role === 'user' ? 'flex-row-reverse justify-end' : 'justify-start',
        ]"
      >
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

        <div :class="['max-w-[70%]', message.role === 'user' ? 'text-right ml-auto' : 'text-left']">
          <div
            :class="[
              'inline-block px-4 py-3 rounded-xl',
              message.role === 'user'
                ? 'bg-[var(--primary-color)] text-white rounded-tr-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-tl-sm',
            ]"
          >
            <div v-if="message.content && !message.file">
              <MarkdownRenderer v-if="message.role === 'assistant'" :content="message.content" />
              <p
                v-else
                :class="[
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  message.role === 'user' ? 'text-white' : 'text-[var(--text-color)]',
                ]"
              >
                {{ message.content }}
              </p>
            </div>

            <div v-else-if="message.role === 'assistant' && !message.content && isLoading">
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

            <div v-if="message.file" class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-[var(--border-color)]/50 flex items-center justify-center flex-shrink-0"
              >
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-sm font-medium truncate',
                    message.role === 'user' ? 'text-white' : 'text-[var(--text-color)]',
                  ]"
                >
                  {{ message.file.name }}
                </p>
                <p
                  :class="[
                    'text-xs',
                    message.role === 'user' ? 'text-white/70' : 'text-[var(--text-secondary)]',
                  ]"
                >
                  {{ message.file.size }}
                </p>
              </div>
            </div>
          </div>
          <span class="text-xs text-[var(--text-secondary)] mt-1 block">{{ message.time }}</span>

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
    </div>

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

    <div v-if="showFileUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-[var(--bg-card)] rounded-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h3 class="font-medium text-[var(--text-color)]">知识库文件</h3>
          <button @click="showFileUploadModal = false" class="p-2 hover:bg-[var(--border-color)]/50 rounded-lg">
            <svg class="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div class="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center mb-4">
            <svg class="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-[var(--text-color)]">拖拽文件到这里上传</p>
            <p class="text-xs text-[var(--text-secondary)] mt-1">支持: {{ ALLOWED_EXTENSIONS.join(', ') }}</p>
            <input type="file" @change="(e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) uploadFile(file); }" class="hidden" id="file-upload" />
            <button @click="() => (document.getElementById('file-upload') as HTMLInputElement)?.click()" class="mt-3 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm">选择文件</button>
          </div>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-if="ragFiles.length === 0" class="text-center text-[var(--text-secondary)] py-4">
              暂无文件
            </div>
            <div v-for="file in ragFiles" :key="file.id" class="flex items-center justify-between p-3 bg-[var(--bg-color)] rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p class="text-sm text-[var(--text-color)]">{{ file.fileName }}</p>
                  <p class="text-xs text-[var(--text-secondary)]">{{ formatFileSize(file.fileSize) }}</p>
                </div>
              </div>
              <button @click="deleteRagFile(file.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
