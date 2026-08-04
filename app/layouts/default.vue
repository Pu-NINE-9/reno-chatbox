<script setup lang="ts">
import localeSelectMenu from '~/components/locale/index.vue'
import pageAside from '~/components/aside/index.vue'

const { locale } = useI18n()
</script>

<template>
  <div :key="locale" class="flex h-screen w-screen overflow-hidden">
    <!-- 左侧边栏 -->
    <pageAside />

    <!-- 右侧主区域 -->
    <div class="flex flex-col flex-1 min-w-0 h-full">
      <!-- 顶部 -->
      <UAppHeader class="h-[56px] text-center shrink-0">
        12312312331123123123
        <localeSelectMenu />
        1231we
      </UAppHeader>

      <!-- 中间内容 -->
      <main class="flex-1 min-h-0 overflow-hidden">
        <slot></slot>
      </main>

      <!-- 底部 -->
      <UAppFooter class="h-[45px] shrink-0">
        <div class="flex items-center justify-center w-full">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            &copy; {{ new Date().getFullYear() }} Nuxt4 Practice Demo
          </div>
        </div>
      </UAppFooter>
    </div>
  </div>
</template>
