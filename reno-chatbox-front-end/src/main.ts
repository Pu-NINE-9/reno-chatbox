import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/main.css'
import './assets/styles/main.scss'
import 'highlight.js/styles/github-dark.css'
import App from './App.vue'
import router from './router'
// TODO: 引入全局语言配置
import i18n from '@/locale/index'
// TODO: 全局注册 SVG 组件
import 'virtual:svg-icons-register'
import svgIcon from '@/components/svg/index.vue'
// TODO: 全局注册自定义指令
import { setupDirectives } from '@/directives'
import { useThemeStore } from '@/stores/theme'
// TODO: 引入虚拟滚动
import VirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VirtualScroller)
app.component('svgIcon', svgIcon) // 全局注册，后续不用引入了
setupDirectives(app) // 全局注册自定义指令

app.mount('#app')

const themeStore = useThemeStore()
themeStore.initTheme()
