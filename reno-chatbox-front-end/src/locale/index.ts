import { createI18n } from 'vue-i18n'
// TODO: 本地语言包
import zhLocale from './config/zh'
import enLocale from './config/en'

const messages = {
  'zh-CN': {
    ...zhLocale,
  },
  en: {
    ...enLocale,
  },
}

const currentLang = localStorage.getItem('lang') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: currentLang,
  fallbackLocale: 'en',
  messages,
})

export default i18n
