// import type { Directive } from 'vue'
// import { marked } from 'marked'
// import hljs from '~/utils/highlights'

// // TODO: 只定义指令对象，不执行任何逻辑
// const vMarkdownLazy: Directive = {
//   mounted(el, binding) {
//     if (!import.meta.client) return
//     const rawMarkdown = binding.value
//     el.innerHTML = '<div>加载中...</div>'

//     const observer = new IntersectionObserver(entries => {
//       const entry = entries[0]
//       if (entry.isIntersecting) {
//         el.innerHTML = marked.parse(rawMarkdown)
//         observer.unobserve(el)
//       }
//     }, { threshold: 0.1, rootMargin: '50px' })

//     observer.observe(el)
//     el._lazyObserver = observer
//   },
//   updated(el, binding) {
//     if (!import.meta.client) return
//     if (binding.value !== binding.oldValue) {
//       el._lazyObserver?.disconnect()
//       const observer = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting) {
//           el.innerHTML = marked.parse(binding.value)
//           observer.unobserve(el)
//         }
//       }, { threshold: 0.1 })
//       observer.observe(el)
//       el._lazyObserver = observer
//     }
//   },
//   unmounted(el) {
//     el._lazyObserver?.disconnect()
//     delete el._lazyObserver
//   }
// }

// // TODO: 测试指令
// const test: Directive = {
//   mounted(el, binding) {
//     if (!import.meta.client) return
//     el.innerHTML = binding.value
//   },
//   updated(el, binding) {
//     if (!import.meta.client) return
//     if (binding.value !== binding.oldValue) el.innerHTML = binding.value
//   }
// }

// // 所有运行时逻辑全部挪到这里
// export default defineNuxtPlugin((nuxtApp) => {
//   // marked 初始化放在插件回调内，不再顶层执行
//   if (import.meta.client) {
//     marked.setOptions({
//       breaks: true,
//       gfm: true,
//       highlight(code, lang) {
//         if (lang && hljs.getLanguage(lang)) {
//           return hljs.highlight(code, { language: lang }).value
//         }
//         return hljs.highlightAuto(code).value
//       }
//     })
//   }

//   // 注册指令，名称不带 v-
//   nuxtApp.vueApp.directive('test', test)
//   nuxtApp.vueApp.directive('markdown-lazy', vMarkdownLazy)
// })
