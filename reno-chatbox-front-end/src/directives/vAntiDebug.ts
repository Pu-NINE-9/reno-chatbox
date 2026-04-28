/**
 * TODO: v-anti-debug
 * 作用：防调试（禁用 F12 / 控制台 / 代码篡改）
 * 防调试了，线上出 bug 怎么查？
 * 只在生产环境开启防调试！
 *
 * 使用方式：
 * 全局使用（推荐）：在 App.vue 根节点挂载 v-anti-debug
 * 局部使用：在需要保护的页面/组件挂载 v-anti-debug
 *
 * 示例：
 * <div v-anti-debug>整个页面受保护</div>
 */

import type { Directive } from "vue"

const vAntiDebug: Directive = {
  mounted () {
    // TODO: 开发环境不开启防调试
    const isDev = import.meta.env.DEV
    const isLocal = window.location.hostname === 'localhost'
    if (isDev || isLocal) return

    // TODO: Ctrl+Shift+I（控制台）、Ctrl+U（查看源码）、Ctrl+Shift+C（元素查找）
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) e.preventDefault()
    })

    // TODO: 防控制台打开
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > 200
      const heightDiff = window.outerHeight - window.innerHeight > 200
      if (widthDiff || heightDiff) {
        document.body.innerHTML = '<h1>请关闭开发者工具</h1>'
      }
    }
    setInterval(checkDevTools, 1000)
  }
}

export default vAntiDebug
