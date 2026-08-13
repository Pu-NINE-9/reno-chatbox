export default defineNuxtPlugin(() => {
  const settingStore = useSettingStore()
  
  // 客户端立刻同步 html 类，优先于页面渲染
  if (import.meta.client) {
    const html = document.documentElement
    if (settingStore.isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    // 后续切换实时同步
    watch(() => settingStore.isDark, (newVal) => {
      newVal ? html.classList.add('dark') : html.classList.remove('dark')
    })
  }
})
