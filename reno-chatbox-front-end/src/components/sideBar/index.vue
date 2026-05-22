<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const { t, locale } = useI18n()
const themeStore = useThemeStore()
const chatStore = useChatStore()

const isCollapsed = ref(false)
const ragFiles = ref<any[]>([])
const isLoading = ref(false)

const currentLang = computed(() => locale.value)

const menuItems = [
  { id: 'chat', name: 'sidebar.chat', icon: 'chat', path: '/chat' },
]

const currentPath = computed(() => router.currentRoute.value.path)

const navigate = (path: string) => {
  router.push(path)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleLang = () => {
  const newLang = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  locale.value = newLang
  localStorage.setItem('lang', newLang)
}

// 点击上传区域触发文件选择
const triggerFileInput = () => {
  const input = window.document.getElementById('rag-file-input') as HTMLInputElement
  if (input) {
    input.click()
  }
}

// 加载RAG文件列表
const loadRagFiles = async () => {
  isLoading.value = true
  try {
    ragFiles.value = await chatStore.listRagFiles()
  } catch (error) {
    console.error('加载文件列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 上传文件
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    isLoading.value = true
    try {
      const result = await chatStore.uploadFileToRag(file)
      if (result.success) {
        await loadRagFiles()
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      alert('文件上传失败')
    } finally {
      isLoading.value = false
      target.value = ''
    }
  }
}

// 删除文件
const handleDeleteFile = async (fileId: string, event: Event) => {
  event.stopPropagation()
  if (confirm('确定要删除这个文件吗？')) {
    isLoading.value = true
    try {
      const success = await chatStore.deleteRagFile(fileId)
      if (success) {
        await loadRagFiles()
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      alert('删除文件失败')
    } finally {
      isLoading.value = false
    }
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 清空对话历史
const handleClearHistory = () => {
  if (confirm('确定要清空所有对话历史吗？此操作不可撤销。')) {
    chatStore.clearAllConversations()
  }
}

// 拖拽上传
const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file) {
    isLoading.value = true
    try {
      const result = await chatStore.uploadFileToRag(file)
      if (result.success) {
        await loadRagFiles()
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      alert('文件上传失败')
    } finally {
      isLoading.value = false
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

onMounted(() => {
  loadRagFiles()
})
</script>

<template>
  <aside
    :class="[
      'h-screen flex flex-col transition-all duration-300 border-r border-[var(--border-color)]',
      isCollapsed ? 'w-16' : 'w-60',
      themeStore.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    ]"
  >
    <!-- Logo 和折叠按钮 -->
    <div class="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
      <div
        class="flex items-center gap-2"
        :class="{ 'opacity-0 w-0 overflow-hidden': isCollapsed }"
      >
        <div
          :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center',
            themeStore.theme === 'dark' ? 'bg-pink-500' : 'bg-green-500',
          ]"
        >
          <span class="text-white font-bold text-lg">R</span>
        </div>
        <span
          :class="[
            'font-semibold text-lg',
            themeStore.theme === 'dark' ? 'text-white' : 'text-gray-900',
          ]"
          >Reno Chat</span
        >
      </div>
      <div
        v-if="!isCollapsed"
        class="w-8 h-8 rounded-lg"
        :class="themeStore.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'"
      >
        <button
          @click="$emit('hide')"
          :class="[
            'w-full h-full flex items-center justify-center',
            themeStore.theme === 'dark'
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 菜单列表 -->
    <nav class="p-3 space-y-1">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="navigate(item.path)"
        :class="[
          'w-full py-2.5 px-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200',
          currentPath === item.path
            ? themeStore.theme === 'dark'
              ? 'bg-pink-500/10 text-pink-400'
              : 'bg-green-500/10 text-green-600'
            : themeStore.theme === 'dark'
              ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
              : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="item.icon === 'chat'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span v-if="!isCollapsed">{{ t(item.name) }}</span>
      </button>
    </nav>

    <!-- RAG 文件管理区域 -->
    <div v-if="!isCollapsed" class="flex-1 flex flex-col p-3">
      <!-- RAG标题 -->
      <div class="mb-3">
        <div
          :class="[
            'text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2',
            themeStore.theme === 'dark'
              ? 'text-gray-500 bg-gray-800/50'
              : 'text-gray-500 bg-gray-100',
          ]"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span>知识库文件</span>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div
        class="border-2 border-dashed rounded-lg p-4 mb-3 cursor-pointer transition-all duration-200"
        :class="[
          themeStore.theme === 'dark'
            ? 'border-gray-700 hover:border-pink-500'
            : 'border-gray-300 hover:border-green-500',
        ]"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @click="triggerFileInput"
      >
        <input
          type="file"
          id="rag-file-input"
          class="hidden"
          @change="handleFileUpload"
          accept=".pdf,.doc,.docx,.txt,.md"
        />
        <div class="flex flex-col items-center gap-2">
          <svg
            class="w-8 h-8"
            :class="themeStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'"
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
          <span
            :class="[
              'text-sm',
              themeStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
            ]"
          >
            拖拽文件或点击上传
          </span>
          <span
            :class="[
              'text-xs',
              themeStore.theme === 'dark' ? 'text-gray-600' : 'text-gray-400',
            ]"
          >
            支持: PDF, DOC, DOCX, TXT, MD
          </span>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="flex-1 overflow-y-auto space-y-2">
        <div v-if="isLoading" class="flex items-center justify-center py-4">
          <svg class="animate-spin w-5 h-5" :class="themeStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div
          v-else-if="ragFiles.length === 0"
          :class="[
            'text-center py-6',
            themeStore.theme === 'dark' ? 'text-gray-600' : 'text-gray-400',
          ]"
        >
          <svg
            class="w-10 h-10 mx-auto mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="text-sm">暂无文件</p>
          <p class="text-xs mt-1">上传文件到知识库</p>
        </div>

        <div
          v-for="file in ragFiles"
          :key="file.id"
          :class="[
            'flex items-center justify-between p-3 rounded-lg transition-all duration-200',
            themeStore.theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200',
          ]"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <svg class="w-5 h-5 flex-shrink-0" :class="themeStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-sm truncate" :class="themeStore.theme === 'dark' ? 'text-white' : 'text-gray-900'">
                {{ file.fileName }}
              </p>
              <p class="text-xs" :class="themeStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'">
                {{ formatFileSize(file.fileSize) }} · {{ file.chunkCount }} 片段
              </p>
            </div>
          </div>
          <button
            @click="handleDeleteFile(file.id, $event)"
            class="p-1.5 rounded-lg transition-all duration-200"
            :class="[
              themeStore.theme === 'dark'
                ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-500'
                : 'hover:bg-red-50 text-gray-400 hover:text-red-500',
            ]"
            title="删除文件"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="p-3 border-t border-[var(--border-color)] space-y-1">
      <button
        @click="themeStore.toggleTheme()"
        :class="[
          'w-full py-2.5 px-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200',
          themeStore.theme === 'dark'
            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="themeStore.theme === 'light'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span v-if="!isCollapsed">{{
          themeStore.theme === 'light' ? t('sidebar.darkMode') : t('sidebar.lightMode')
        }}</span>
      </button>
      <button
        @click="toggleLang"
        :class="[
          'w-full py-2.5 px-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200',
          themeStore.theme === 'dark'
            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span v-if="!isCollapsed">{{ currentLang === 'zh-CN' ? 'English' : '中文' }}</span>
      </button>
      <button
        @click="handleClearHistory"
        :class="[
          'w-full py-2.5 px-4 rounded-lg text-left flex items-center gap-3 transition-all duration-200',
          themeStore.theme === 'dark'
            ? 'text-red-400 hover:bg-red-500/20 hover:text-red-400'
            : 'text-red-500 hover:bg-red-50 hover:text-red-500',
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span v-if="!isCollapsed">清空历史</span>
      </button>
    </div>
  </aside>
</template>
