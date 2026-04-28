<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useI18n } from 'vue-i18n'

// TODO: 国际化处理
const { locale } = useI18n()
const elLocale = computed(() => locale.value === 'zh-CN' ? zhCn : en)

import { useECharts, useRequest } from '@/hooks'
import { getDataAPI } from '@/api'
import type { EChartsOption } from '@/utils'

const myChart = ref<HTMLElement | null>(null)
const options: EChartsOption = {
  title: {
    text: '测试折线图',
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '销量',
      type: 'line',
      data: [10, 20, 30, 40, 50],
    },
  ],
}
useECharts(myChart, options)

const { data, run: getProverb, error } = useRequest(getDataAPI)

const handleClick = async () => {
  try {
    await getProverb()
    console.log('click后：', data.value)
  } catch (err) {
    console.log(error.value)
  }
}
</script>

<template>
  <el-config-provider :locale="elLocale">
    <!-- 整体架子 -->
    <div class="h-screen w-full">
      <el-row :span="24" class="h-full">
        <el-col :span="4" class="bg-red-100 h-full">
          <div>历史信息栏</div>
          <svgIcon name="cow" :width="`26px`" :height="`26px`" color="red" />
        </el-col>
        <el-col :span="20" class="h-full">
          <div @click="handleClick">对话区域</div>
          <div ref="myChart" style="height: 400px; width: 400px"></div>
          <!-- 路由出口 -->
            <router-view />
        </el-col>
      </el-row>
    </div>
  </el-config-provider>
</template>

<style lang="scss" scoped>
</style>
