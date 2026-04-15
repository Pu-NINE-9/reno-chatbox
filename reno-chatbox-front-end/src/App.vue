<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useI18n } from 'vue-i18n'
import homeView from '@/views/homeView/index.vue'
const { locale } = useI18n()

const elLocale = computed(() => locale.value === 'zh-CN' ? zhCn : en)
</script>

<template>
  <div>
    <h1>You did it!</h1>
    <el-button type="primary">12123</el-button>
    <el-config-provider :locale="elLocale">
    <homeView></homeView>
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>

<style lang="scss" scoped>
</style>
