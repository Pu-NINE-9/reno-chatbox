export const useSettingStore = defineStore('setting', () => {
    const sidebarOpen = ref<boolean>(true)

    // 封装切换方法，组件统一调用
    const toggleSidebar = () => {
        sidebarOpen.value = !sidebarOpen.value
        console.log('click')
    }

    return {
      sidebarOpen,
      toggleSidebar
    }
  }, {
    persist: {
      pick: ['sidebarOpen']
    }
  }
)
