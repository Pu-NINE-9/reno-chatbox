// TODO: 节流钩子
import { throttle } from 'lodash'

/**
 * 节流 Hook
 * 原理：高频触发时，【固定时间内只执行一次】
 * 场景：防止重复提交、滚动加载、频繁点击事件
 *
 * @param fn 需要节流执行的函数
 * @param delay 间隔时间（毫秒），默认 1000ms
 * @returns run: 节流执行函数
 */
export const useThrottle = <T extends (...args: any[]) => void>(
  fn: T,
  delay = 500
) => {
  const throttleFn = throttle(fn, delay)

  return {
    run: throttleFn
  }
}
