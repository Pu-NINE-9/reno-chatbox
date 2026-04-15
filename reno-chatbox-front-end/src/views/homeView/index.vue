<template>
  <div>
    <!-- 这两个组件自带中文/英文，一测就知道 -->
    <el-pagination :total="100" />

    <el-table
      :data="[]"
      style="width: 100%"
    >
      <el-table-column
        prop="date"
        :label="$t('language')"
        width="180"
      />
    </el-table>

    <!-- 切换语言按钮 -->
    <el-button @click="switchLang('zh-CN')">简体中文</el-button>
    <el-button @click="switchLang('en')">English</el-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

const switchLang = (lang: 'zh-CN' | 'en') => {
  locale.value = lang
  localStorage.setItem('lang', lang)
  location.reload()
}
</script>
