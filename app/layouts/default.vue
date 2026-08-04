<script setup lang="ts">
import pageTop from '~/components/top/index.vue'
import pageAside from '~/components/aside/index.vue'

const { locale } = useI18n()
const settingStore = useSettingStore()
</script>

<template>
  <div :key="locale" class="flex h-screen w-screen overflow-hidden">
    <!-- 左侧边栏 -->
    <Transition name="sidebar-fade">
      <pageAside v-if="settingStore.sidebarOpen" />
    </Transition>

    <!-- 右侧主区域 -->
    <div class="flex flex-col flex-1 min-w-0 h-full">
      <!-- 顶部 -->
      <pageTop />

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

<style scoped>
.sidebar-fade-enter-from {
  opacity: 0;
}
.sidebar-fade-enter-active {
  transition: opacity 0.3s ease;
}
.sidebar-fade-enter-to {
  opacity: 1;
}

.sidebar-fade-leave-from {
  opacity: 1;
}
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease;
}
.sidebar-fade-leave-to {
  opacity: 0;
}
</style>