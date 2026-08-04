export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/ui',
    '@comark/nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  // TODO: app配置
  app: {
    head: {
      // 设置网站logo
      link: [
        {
          rel: 'icon',
          href: '/website-logo.ico',
          type: 'image/x-icon'
        }
      ]
    }
  },
  // TODO: i18n国际化配置
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
      redirectOn: 'root',
      fallbackLocale: 'zh'
    },
    locales: [
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ]
  },
  // TODO: pinia 配置
  pinia: {
    storesDirs: ['stores']
  },
  // ✅ 全局自动导入，这是Nuxt标准API，类型不会报错
  imports: {
    presets: [
      {
        from: 'pinia',
        imports: ['defineStore']
      }
    ]
  },
  // TODO: 指定CSS位置
  css: ['~/assets/css/main.css'],
  // TODO: ui 配置
  ui: {
    // 禁用自动引入 @nuxt/fonts 模块，不再发起google请求
    fonts: false
  },
  // TODO: 兼容性配置
  compatibilityDate: '2025-07-31',
  // TODO: 开启devtools
   devtools: {
    enabled: true
  },
  // TODO: 环境变量配置
  runtimeConfig: {
    // 仅服务端可见, 不会暴露给前端
    db: {
      host: process.env.NUXT_DB_HOST,
      port: Number(process.env.NUXT_DB_PORT),
      user: process.env.NUXT_DB_USER,
      password: process.env.NUXT_DB_PASSWORD,
      database: process.env.NUXT_DB_DATABASE
    },
    ai: {
      apiKey: process.env.NUXT_DEEPSEEK_API_KEY,
      modelName: process.env.NUXT_MODEL_NAME,
      systemPromptText: process.env.NUXT_MODEL_SYSTEM_PROMPT_TEXT,
    }
  },
  vite: {
    // 关闭模块持久化缓存，根治长时间运行缓存卡死
    cacheDir: '.vite-cache',
    server: {
      // Windows 修复文件监听失效
      watch: {
        usePolling: true, // 轮询模式！解决Windows chokidar监听丢失
        interval: 800
      }
    },
    build: {
      sourcemap: true
    }
  },
})