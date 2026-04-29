<script setup lang="ts">
import { ref, computed } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useI18n } from 'vue-i18n'
import SideBar from '@/components/sideBar/index.vue'

const { locale } = useI18n()
const elLocale = computed(() => (locale.value === 'zh-CN' ? zhCn : en))

const isSidebarHidden = ref(false)

const toggleSidebar = () => {
  isSidebarHidden.value = !isSidebarHidden.value
}
</script>

<template>
  <el-config-provider :locale="elLocale">
    <div class="flex h-screen bg-[var(--bg-color)]">
      <!-- 侧导航栏 -->
      <transition name="slide">
        <SideBar v-show="!isSidebarHidden" @hide="toggleSidebar" />
      </transition>

      <!-- 还原侧导航栏按钮 -->
      <button
        v-show="isSidebarHidden"
        @click="toggleSidebar"
        class="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-[var(--bg-card)] border border-r-0 border-[var(--border-color)] rounded-r-lg hover:bg-[var(--border-color)]/50 transition-colors"
      >
        <svg
          class="w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- 主内容区 -->
      <main class="flex-1 overflow-hidden">
        <router-view />
      </main>
    </div>
  </el-config-provider>
</template>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
