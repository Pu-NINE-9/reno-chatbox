/**
 * TODO: v-debounce
 * 作用：防抖
 * 防调试了，线上出 bug 怎么查？
 * 只在生产环境开启防调试！
 *
 * 配置项说明：
 * - handler: 必传，触发的执行函数
 * - delay: 可选，防抖延迟时间，默认 500ms
 * - immediate: 可选，是否立即执行，默认 false（搜索框用false，按钮用true）
 *
 * 示例 1：搜索框输入（停止输入 500ms 后执行）
 * <input v-model="keyword" v-debounce:input="handleSearch" />
 *
 * 示例 2：按钮防重复提交（点击立即执行，800ms 内不可重复点击）
 * <button v-debounce:click="{ handler: handleSubmit, delay: 800, immediate: true }" />
 *
 * 示例 3：自定义延迟搜索
 * <input v-debounce:input="{ handler: handleSearch, delay: 600 }" />
 */

import type { Directive } from "vue"
import { debounce } from 'lodash-es'
import type { DebouncedFunc } from 'lodash-es'

const debounceMap = new WeakMap<HTMLElement, DebouncedFunc<(...args: any[]) => void>>() // TODO: 缓存每个DOM对应的防抖函数，卸载时清理

const vDebounce: Directive = {
  // TODO: 挂载时
  mounted (el, binding) {
    // TODO: 默认事件input（搜索框）
    const eventName = binding.arg || 'input' // .arg就是v-debounce:click里的click

    // TODO: 解析用户传的参数
    let handler: (...args: any[]) => void, delay = 500, immediate = false

    if (typeof binding.value === 'function') {
      handler = binding.value
    } else {
      handler = binding.value.handler
      delay = binding.value.delay ?? 500
      immediate = binding.value.immediate ?? false
    }

    // TODO: 创建防抖函数
    const debounceFn = debounce(handler, delay, {
      leading: immediate, // 是否立即执行
      trailing: !immediate // 是否等待结束后再执行
    })

    // TODO: 将防抖函数绑定在这个元素的点击事件上
    el.addEventListener(eventName, debounceFn)

    // TODO: 放入缓存，等组件卸载时要释放内存的
    debounceMap.set(el, debounceFn)
  },
  // TODO: 卸载时
  unmounted (el) {
    const fn = debounceMap.get(el)
    if (fn) {
      fn.cancel() // 使用lodash自带的清理
      debounceMap.delete(el)
    }
  }
}

export default vDebounce
