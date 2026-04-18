<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useI18n } from 'vue-i18n'

// TODO: 国际化处理
const { locale } = useI18n()
const elLocale = computed(() => locale.value === 'zh-CN' ? zhCn : en)
</script>

<template>
  <el-config-provider :locale="elLocale">
    <!-- 整体架子 -->
    <div class="h-screen w-full">
      <el-row :span="24" class="h-full">
        <el-col :span="4" class="bg-red-100 h-full">
          <div>历史信息栏</div>
        </el-col>
        <el-col :span="20" class="h-full">
          <div>对话区域</div>
          <!-- 路由出口 -->
            <router-view />
        </el-col>
      </el-row>
    </div>
  </el-config-provider>
</template>

<style lang="scss" scoped>
</style>
