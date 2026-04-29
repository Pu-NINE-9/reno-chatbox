<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const { t, locale } = useI18n()
const themeStore = useThemeStore()

const isCollapsed = ref(false)

const currentLang = computed(() => locale.value)

const menuItems = [
  { id: 'chat', name: 'sidebar.chat', icon: 'chat', path: '/chat' },
  { id: 'dashboard', name: 'sidebar.dashboard', icon: 'dashboard', path: '/dashboard' },
]

const historyItems = ref([
  { id: 1, title: '初二英语暑期辅导', time: '10:23' },
  { id: 2, title: '毕业论文', time: '昨天' },
  { id: 3, title: '智能停车数据分析系...', time: '昨天' },
  { id: 4, title: 'Interpreting Course', time: '06/15' },
  { id: 5, title: '英语口语聊天搭子', time: '06/14' },
  { id: 6, title: '英语口语长对话情景...', time: '06/13' },
])

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
          <span class="text-white font-bold text-lg">A</span>
        </div>
        <span
          :class="[
            'font-semibold text-lg',
            themeStore.theme === 'dark' ? 'text-white' : 'text-gray-900',
          ]"
          >AuraChat</span
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

    <!-- 新建对话按钮 -->
    <div class="p-3">
      <button
        @click="navigate('/chat')"
        :class="[
          'w-full py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2',
          themeStore.theme === 'dark' ? 'bg-pink-500 text-white' : 'bg-green-500 text-white',
        ]"
      >
        <span>+</span>
        <span v-if="!isCollapsed">{{ t('sidebar.newChat') }}</span>
      </button>
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
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span v-if="!isCollapsed">{{ t(item.name) }}</span>
      </button>
    </nav>

    <!-- 历史对话标题 -->
    <div v-if="!isCollapsed" class="px-3">
      <div
        :class="[
          'text-xs font-medium px-3 py-2 rounded-lg',
          themeStore.theme === 'dark'
            ? 'text-gray-500 bg-gray-800/50'
            : 'text-gray-500 bg-gray-100',
        ]"
      >
        {{ t('sidebar.history') }}
      </div>
    </div>

    <!-- 历史对话列表 -->
    <nav v-if="!isCollapsed" class="flex-1 p-3 space-y-1 overflow-y-auto">
      <button
        v-for="item in historyItems"
        :key="item.id"
        @click="navigate('/chat')"
        :class="[
          'w-full py-2 px-3 rounded-lg text-left flex items-center justify-between transition-all duration-200 truncate',
          themeStore.theme === 'dark'
            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        ]"
      >
        <span class="truncate flex-1 text-sm">{{ item.title }}</span>
        <span class="text-xs text-gray-500 flex-shrink-0 ml-2">{{ item.time }}</span>
      </button>
    </nav>

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
    </div>

    <!-- NINE 和 Pro 会员 -->
    <div v-if="!isCollapsed" class="p-3 border-t border-[var(--border-color)]">
      <div class="flex items-center gap-2">
        <div
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center',
            themeStore.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200',
          ]"
        >
          <span
            :class="[
              'text-xs font-bold',
              themeStore.theme === 'dark' ? 'text-white' : 'text-gray-700',
            ]"
            >N</span
          >
        </div>
        <div class="flex-1 min-w-0">
          <p
            :class="[
              'text-sm font-medium truncate',
              themeStore.theme === 'dark' ? 'text-white' : 'text-gray-900',
            ]"
          >
            NINE
          </p>
          <p :class="['text-xs', themeStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-500']">
            {{ t('sidebar.proMember') }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
