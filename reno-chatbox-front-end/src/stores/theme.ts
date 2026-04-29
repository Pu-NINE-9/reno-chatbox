import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式: 'light' | 'dark'
  const theme = ref<'light' | 'dark'>('light')

  // 亮色主题颜色变量
  const lightColors = {
    primary: '#00C853',
    primaryLight: '#69F0AE',
    primaryDark: '#00B049',
    bg: '#FFFFFF',
    bgSidebar: '#F8FAFC',
    bgCard: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  }

  // 暗色主题颜色变量
  const darkColors = {
    primary: '#F472B6',
    primaryLight: '#F9A8D4',
    primaryDark: '#EC4899',
    bg: '#0F172A',
    bgSidebar: '#1E293B',
    bgCard: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  }

  // 当前主题颜色
  const colors = computed(() => theme.value === 'light' ? lightColors : darkColors)

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    // 更新 html 的 class
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      theme.value = savedTheme
    }
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  return {
    theme,
    colors,
    toggleTheme,
    initTheme,
  }
})