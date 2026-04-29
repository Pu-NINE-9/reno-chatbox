/**
 * TODO: v-throttle 节流指令
 * 作用：固定时间间隔内，只执行一次，限制高频触发频率
 * 适用场景：滚动监听、窗口resize、鼠标移动、频繁点击、下拉加载更多
 *
 * 使用方式：
 * 指令格式：v-throttle:事件名="处理函数" 或 v-throttle:事件名="{ 配置 }"
 * 事件名支持：click / scroll / mousemove / resize 等 DOM 事件
 *
 * 配置说明：
 * - handler: 必传，节流触发执行的函数
 * - delay: 可选，节流间隔时间，默认 800ms
 *
 * 示例 1：节流按钮（800ms 内只能点一次）
 * <button v-throttle:click="{ handler: handleClick, delay: 1000 }">节流按钮</button>
 *
 * 示例 2：页面滚动节流监听
 * <div v-throttle:scroll="handleScroll">滚动区域</div>
 */
import type { Directive } from 'vue'
import { throttle } from 'lodash'
import type { ThrottledFunc } from 'lodash'

// 缓存每个DOM对应的节流函数，组件卸载时清理，防止内存泄漏
const throttleMap = new WeakMap<HTMLElement, ThrottledFunc<(...args: any[]) => void>>()

const vThrottle: Directive = {
  mounted(el, binding) {
    // 取指令参数作为事件名，默认 click
    const eventName = binding.arg || 'click'

    let handler: (...args: any[]) => void
    let delay = 800

    // 兼容两种传参写法：直接传函数 / 传配置对象
    if (typeof binding.value === 'function') {
      handler = binding.value
    } else {
      handler = binding.value.handler
      delay = binding.value.delay ?? 800
    }

    // 创建节流函数
    const throttleFn = throttle(handler, delay, {
      leading: true,
      trailing: false
    })

    // 绑定对应DOM事件
    el.addEventListener(eventName, throttleFn)

    // 存入WeakMap缓存
    throttleMap.set(el, throttleFn)
  },

  // 组件/元素卸载：清事件、清定时器、防内存泄漏
  unmounted(el) {
    const fn = throttleMap.get(el)
    if (fn) {
      // lodash 自带取消节流
      fn.cancel()
      // 从缓存删除
      throttleMap.delete(el)
    }
  }
}

export default vThrottle
