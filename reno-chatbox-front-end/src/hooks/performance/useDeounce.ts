// TODO: 防抖钩子
import { debounce } from 'lodash'

/**
 * TODO: 防抖 Hook
 * 原理：高频触发时，只在【最后一次触发】结束后等待 delay 毫秒，再执行一次
 * 场景：搜索框输入、窗口 resize、表单实时验证
 *
 * @param fn 需要防抖执行的函数
 * @param delay 延迟时间（毫秒），默认 500ms
 * @returns run: 防抖执行函数 | cancel: 取消等待执行
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay = 1000
) => {
  const debounceFn = debounce(fn, delay)

  return {
    run: debounceFn, // 执行函数
    cancel: debounceFn.cancel // 取消函数
  }
}
