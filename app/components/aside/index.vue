<script setup lang="ts">
import asideTop from './components/asideTop.vue'
import asideMid from './components/asideMid.vue'
import asideBottom from './components/asideBottom.vue'
</script>

<template>
  <aside class="hidden lg:flex w-56 shrink-0 h-full flex-col border-r-2 border-[var(--ui-primary)]">
    <!-- 顶部slogan -->
     <asideTop />

    <!-- 中间历史对话记录 -->
    <asideMid />

    <!-- 底部RAG文件区域 -->
    <asideBottom />
  </aside>
</template>
