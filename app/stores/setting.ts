export const useSettingStore = defineStore('setting', () => {
  const sidebarOpen = ref<boolean>(true)
  // 暗黑模式
  const isDark = ref<boolean>(false)

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  // 切换主题
  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  return {
    sidebarOpen,
    toggleSidebar,
    isDark,
    toggleDark
  }
}, {
  persist: {
    // 持久化两个字段
    pick: ['sidebarOpen','isDark']
  }
})
