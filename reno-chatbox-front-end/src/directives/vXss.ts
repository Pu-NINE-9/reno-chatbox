/**
 * TODO: v-xss
 * 作用：专门用来防 XSS 注入攻击（即恶意输入）
 *
 * 示例：
 * <div v-xss="userInput">用户输入内容</div>
 * <div v-xss="aiReply">AI 回复内容</div>
 */

import type { Directive } from 'vue'
import DOMPurify from 'dompurify'

// 全局配置（企业级，允许部分安全标签）
const purify = DOMPurify
purify.setConfig({
  ADD_TAGS: ['mark', 'code', 'pre', 'p', 'br', 'span', 'div'], // 允许的标签
  ADD_ATTR: ['class', 'style'], // 允许的属性
})

const vXSS: Directive = {
  mounted(el, binding) {
    // 元素挂载到页面就清洗 HTML
    el.innerHTML = purify.sanitize(binding.value || '')
  },
  // 4. 组件更新时数据变化时执行
  updated(el, binding) {
    el.innerHTML = purify.sanitize(binding.value || '')
  },
}

export default vXSS
