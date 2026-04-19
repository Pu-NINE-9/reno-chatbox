import { echarts } from '@/utils/echarts'
import type { EChartsOption, ECharts } from '@/utils/echarts'

/**
 * ECharts 图表 Hook
 * 自动初始化、响应式更新配置、自动销毁、窗口自适应
 *
 * @param elRef - 图表挂载的 DOM 引用
 * @param option - 图表配置项
 * @param autoResize - 是否自动跟随窗口大小变化
 * @returns 图表实例 & 手动更新方法
 * @returns chart - ECharts 实例
 * @returns updateOption - 手动更新配置
 */
export const useECharts = (
  elRef: HTMLElement | null | undefined,
  option: EChartsOption,
  autoResize = true
) => {
  const chart = ref<ECharts | null>(null)

  // 初始化图表
  const initChart = () => {
    const dom = unref(elRef)
    if (!dom) return
    chart.value = echarts.init(dom)
    chart.value.setOption(option)
  }

  // 更新配置
  const updateOption = (newOption: EChartsOption) => {
    chart.value?.setOption(newOption)
  }

  // 监听配置变化
  watch(
    () => option,
    () => updateOption(option),
    { deep: true }
  )

  // 监听 DOM 元素变化
  watch(
    () => unref(elRef),
    (newEl) => {
      if (newEl) {
        initChart()
        if (autoResize) {
          resizeObserver?.disconnect()
          resizeObserver = new ResizeObserver(resize)
          resizeObserver.observe(newEl)
        }
      }
    },
    { immediate: true }
  )

  // 窗口变化重绘
  const resize = () => chart.value?.resize()

  // 监听元素尺寸变化
  let resizeObserver: ResizeObserver | null = null // 监听DOM元素自身大小变化，当DOM变化时图表大小自动跟着变化

  // TODO: 组件挂载
  onMounted(() => {
    initChart()
    if (autoResize) {
      window.addEventListener('resize', resize)
      const dom = unref(elRef)
      if (dom) {
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(dom)
      }
    }
  })

  // TODO: 组件卸载
  onUnmounted(() => {
    if (autoResize) {
      window.removeEventListener('resize', resize)
      resizeObserver?.disconnect()
    }
    chart.value?.dispose()
    chart.value = null
  })

  return {
    chart: chart.value,
    updateOption,
  }
  // 就在文件里useECharts(chartRef, option)就可以挂载图表了
}
