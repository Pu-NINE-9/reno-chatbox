/**
 * 从 echarts/core 导入 ComposeOption 和 ECharts 类型
 * ComposeOption 是 ECharts 提供的类型组合工具，用于创建包含多种组件和图表类型的配置选项类型
 * ECharts 是 ECharts 实例的类型
 */
import type { ComposeOption } from 'echarts/core'

/**
 * 从 echarts/charts 导入图表系列类型
 * 这些类型定义了不同图表的配置选项结构
 */
import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption
} from 'echarts/charts'

/**
 * 从 echarts/components 导入组件配置类型
 * 这些类型定义了各种 ECharts 组件的配置选项结构
 */
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  GridComponentOption,
  VisualMapComponentOption,
  GeoComponentOption
} from 'echarts/components'

/**
 * 导出具体的图表类型，方便在需要时单独使用
 */
export type { ECharts } from 'echarts/core'
export type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption
} from 'echarts/charts'

/**
 * 统一的 EChartsOption 类型
 * 使用 ComposeOption 组合所有需要的类型，创建一个完整的配置选项类型
 * 这样可以获得更好的类型提示和类型检查
 */
export type EChartsOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | GridComponentOption
  | VisualMapComponentOption
  | GeoComponentOption
>
