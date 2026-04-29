<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useECharts } from '@/hooks/echarts/useECharts'
import type { EChartsOption } from '@/utils/echarts'

const { t } = useI18n()
const chartRef = ref<HTMLElement | null>(null)
const chartRef2 = ref<HTMLElement | null>(null)

const tokenStats = ref({
  used: 312480,
  usedChange: 12.4,
  remaining: 187520,
  remainingTotal: 500000,
  todayUsed: 18240,
  todayAverage: 12400,
  conversations: 284,
})

const usageProgress = ref({
  personal: {
    name: t('dashboard.personalProject'),
    used: 312480,
    total: 500000,
    input: 166800,
    output: 115600,
  },
})

const modelDistribution = ref([
  { name: 'GPT-4o', value: 180000, percentage: 58 },
  { name: 'GPT-4o mini', value: 85000, percentage: 27 },
  { name: 'Claude 3', value: 32000, percentage: 10 },
  { name: 'Gemini Pro', value: 15480, percentage: 5 },
])

const lineChartOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: '#334155',
    borderWidth: 1,
    textStyle: { color: '#F1F5F9' },
    formatter: (params: any) => {
      const date = params[0].axisValue
      let html = `<div class="font-medium mb-2">${date}</div>`
      params.forEach((item: any) => {
        html += `<div class="flex items-center gap-2">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color}"></span>
          <span>${item.seriesName}: ${item.value.toLocaleString()}</span>
        </div>`
      })
      return html
    },
  },
  legend: {
    data: [t('dashboard.used'), t('dashboard.input')],
    bottom: 0,
    textStyle: { color: 'var(--text-secondary)' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['6/1', '6/5', '6/9', '6/13', '6/17', '6/21', '6/25', '6/29'],
    axisLine: { lineStyle: { color: 'var(--border-color)' } },
    axisLabel: { color: 'var(--text-secondary)' },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: 'var(--border-color)', type: 'dashed' } },
    axisLabel: { color: 'var(--text-secondary)', formatter: (value: number) => `${(value / 1000).toFixed(0)}K` },
  },
  series: [
    {
      name: t('dashboard.used'),
      type: 'line',
      smooth: true,
      data: [20000, 28000, 18000, 45000, 52000, 58000, 68000, 81000],
      lineStyle: { color: 'var(--primary-color)', width: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(244, 114, 182, 0.3)' },
            { offset: 1, color: 'rgba(244, 114, 182, 0.05)' },
          ],
        },
      },
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: 'var(--primary-color)' },
    },
    {
      name: t('dashboard.input'),
      type: 'line',
      smooth: true,
      data: [12000, 16000, 10000, 28000, 32000, 36000, 42000, 51000],
      lineStyle: { color: 'var(--text-secondary)', width: 2, type: 'dashed' },
      symbol: 'circle',
      symbolSize: 4,
      itemStyle: { color: 'var(--text-secondary)' },
    },
  ],
}

const barChartOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: '#334155',
    borderWidth: 1,
    textStyle: { color: '#F1F5F9' },
    axisPointer: { type: 'shadow' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: modelDistribution.value.map((item) => item.name),
    axisLine: { lineStyle: { color: 'var(--border-color)' } },
    axisLabel: { color: 'var(--text-secondary)' },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: 'var(--border-color)', type: 'dashed' } },
    axisLabel: { color: 'var(--text-secondary)', formatter: (value: number) => `${(value / 1000).toFixed(0)}K` },
  },
  series: [
    {
      type: 'bar',
      data: modelDistribution.value.map((item) => ({
        value: item.value,
        itemStyle: {
          color: 'var(--primary-color)',
          borderRadius: [4, 4, 0, 0],
        },
      })),
      barWidth: '60%',
    },
  ],
}

useECharts(chartRef, lineChartOption)
useECharts(chartRef2, barChartOption)
</script>

<template>
  <div class="p-6 h-full overflow-y-auto bg-[var(--bg-color)]">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-[var(--text-color)]">{{ t('dashboard.title') }}</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-1">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div
        class="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg"
      >
        <span class="text-sm text-[var(--text-secondary)]">2024年6月</span>
        <svg
          class="w-4 h-4 text-[var(--text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-[var(--text-secondary)]">{{ t('dashboard.usedTokens') }}</span>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              tokenStats.usedChange > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            ]"
          >
            {{ tokenStats.usedChange > 0 ? '+' : '' }}{{ tokenStats.usedChange }}%
          </span>
        </div>
        <div class="text-2xl font-bold text-[var(--text-color)]">
          {{ tokenStats.used.toLocaleString() }}
        </div>
        <p class="text-xs text-[var(--text-secondary)] mt-1">{{ t('dashboard.thisMonth') }}</p>
      </div>

      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-[var(--text-secondary)]">{{
            t('dashboard.remainingTokens')
          }}</span>
          <svg
            class="w-4 h-4 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div class="text-2xl font-bold text-[var(--text-color)]">
          {{ tokenStats.remaining.toLocaleString() }}
        </div>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          {{ t('dashboard.total') }} {{ tokenStats.remainingTotal.toLocaleString() }}
        </p>
      </div>

      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-[var(--text-secondary)]">{{ t('dashboard.todayUsed') }}</span>
          <svg
            class="w-4 h-4 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="text-2xl font-bold text-[var(--text-color)]">
          {{ tokenStats.todayUsed.toLocaleString() }}
        </div>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          {{ t('dashboard.average') }} {{ tokenStats.todayAverage.toLocaleString() }}
        </p>
      </div>

      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-[var(--text-secondary)]">{{
            t('dashboard.conversations')
          }}</span>
          <svg
            class="w-4 h-4 text-[var(--text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div class="text-2xl font-bold text-[var(--text-color)]">
          {{ tokenStats.conversations }}
        </div>
        <p class="text-xs text-[var(--text-secondary)] mt-1">{{ t('dashboard.thisMonth') }}</p>
      </div>
    </div>

    <!-- 进度条区域 -->
    <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-[var(--text-color)]">{{ t('dashboard.usageProgress') }}</h3>
        <span class="text-sm text-[var(--primary-color)]"
          >{{ ((tokenStats.used / tokenStats.remainingTotal) * 100).toFixed(0) }}%</span
        >
      </div>

      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-[var(--text-secondary)]">{{
              usageProgress.personal.name
            }}</span>
            <span class="text-sm text-[var(--text-color)]"
              >{{ usageProgress.personal.used.toLocaleString() }} /
              {{ usageProgress.personal.total.toLocaleString() }} tokens</span
            >
          </div>
          <div class="h-3 bg-[var(--border-color)]/30 rounded-full overflow-hidden">
            <div
              class="h-full bg-[var(--primary-color)] rounded-full transition-all duration-500"
              :style="{
                width: `${(usageProgress.personal.used / usageProgress.personal.total) * 100}%`,
              }"
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-xs text-[var(--text-secondary)]">{{ t('dashboard.input') }}</span>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-2 bg-[var(--border-color)]/30 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[var(--primary-color)]/60 rounded-full"
                  :style="{
                    width: `${(usageProgress.personal.input / usageProgress.personal.total) * 100}%`,
                  }"
                ></div>
              </div>
              <span class="text-xs text-[var(--text-color)]">{{
                usageProgress.personal.input.toLocaleString()
              }}</span>
            </div>
          </div>
          <div>
            <span class="text-xs text-[var(--text-secondary)]">{{ t('dashboard.output') }}</span>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-2 bg-[var(--border-color)]/30 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[var(--primary-color)] rounded-full"
                  :style="{
                    width: `${(usageProgress.personal.output / usageProgress.personal.total) * 100}%`,
                  }"
                ></div>
              </div>
              <span class="text-xs text-[var(--text-color)]">{{
                usageProgress.personal.output.toLocaleString()
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--text-color)] mb-4">{{ t('dashboard.usageTrend') }}</h3>
        <div ref="chartRef" class="h-72"></div>
      </div>

      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--text-color)] mb-4">{{ t('dashboard.modelDistribution') }}</h3>
        <div ref="chartRef2" class="h-72"></div>

        <!-- 模型列表 -->
        <div class="mt-4 space-y-3">
          <div
            v-for="model in modelDistribution"
            :key="model.name"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-[var(--text-secondary)]">{{ model.name }}</span>
            <span class="text-sm text-[var(--text-color)]">{{ model.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>