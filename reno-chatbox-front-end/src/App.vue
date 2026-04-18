<script setup lang="ts">
import layout from './layout/index.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useI18n } from 'vue-i18n'

// TODO: 国际化处理
const { locale } = useI18n()
const elLocale = computed(() => locale.value === 'zh-CN' ? zhCn : en)
</script>

<template>
  <div>
    <layout />
  </div>
</template>

<style lang="scss" scoped>
</style>
