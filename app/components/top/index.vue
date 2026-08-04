<script setup lang="ts">
import localeSelectMenu from '~/components/locale/index.vue'

const settingStore = useSettingStore()
</script>

<template>
  <UAppHeader
    class="flex justify-center md:justify-between items-center w-full h-[56px] text-center shrink-0 border-0 border-b-2 border-[var(--ui-primary)]"
  >
    <!-- 侧边栏切换按钮 -->
    <UIcon
      :name="settingStore.sidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
      class="hidden md:block ml-6 text-[var(--ui-primary)] cursor-pointer size-6 hover:text-white"
      @click="settingStore.toggleSidebar"
    />

    <!-- 应用标题 -->
    <h3 class="text-2xl font-bold text-[var(--ui-primary)]">Nuxt4 Practice Demo</h3>

    <!-- 语言选择菜单 -->
    <localeSelectMenu class="hidden md:block mr-10" />
  </UAppHeader>
</template>
