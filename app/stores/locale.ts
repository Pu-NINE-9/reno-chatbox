// TODO: 语言仓库
export const useLocaleStore = defineStore('locale', () => {
    const { locales, setLocale, locale } = useI18n()

    const language = ref<string>(locale.value)

    // TODO: 计算得到语言包列表
    const localeItems = computed(() => {
      if (!locales.value) return []
      return locales.value.map((item) => ({
        label: item.name,
        id: item.code
      }))
    })

    // TODO: 切换语言包
    const onChange = (value: string) => setLocale(value)

    return {
      language,
      localeItems,
      onChange,
    }
  }, {
    // 持久化存储语言包
    persist: {
      pick: ['language']
    }
  })
