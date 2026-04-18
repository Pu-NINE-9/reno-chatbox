// TODO: 二次封装 ECharts 实例
import * as echarts from 'echarts/core'

// 引入使用的图表
import {
  BarChart,
  LineChart,
  PieChart
} from 'echarts/charts'

// 系列组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components'

// 功能增强模块
import {
  LabelLayout,
  UniversalTransition
} from 'echarts/features'

// 渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 注册所有必须组件
echarts.use([
  // 图表
  BarChart,
  LineChart,
  PieChart,
  // 组件
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
  GeoComponent,
  // 功能
  LabelLayout,
  UniversalTransition,
  // 渲染
  CanvasRenderer
])

// 导出类型
export * from '../../types'

// 导出手动封装后的 echarts
export { echarts }
