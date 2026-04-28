/**
 * TODO: v-anti-capture
 * 作用：防截图 + 防右键
 *
 * 使用方式：
 * 给需要保护的 DOM 元素直接添加指令即可
 *
 * 示例：
 * <div v-anti-capture>这里的内容无法复制、无法右键、无法选择</div>
 */

import type { Directive } from 'vue'

const vAntiCapture: Directive = {
  mounted(el) {
    // TODO: 禁止右键菜单
    el.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault())
    // TODO: 禁止剪切
    el.addEventListener('cut', (e: MouseEvent) => e.preventDefault())
    // TODO: 防选中复制（浏览器策略降级处理）
    el.style.webkitUserSelect = 'none'
    el.style.pointerEvents = 'auto'
  }
}

export default vAntiCapture
