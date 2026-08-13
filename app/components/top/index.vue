<script setup lang="ts">
import localeSelectMenu from "~/components/locale/index.vue"
const settingStore = useSettingStore()

// 点击只需要调用仓库方法，html 交给插件监听
const toggleTheme = () => settingStore.toggleDark()
</script>

<template>
  <UAppHeader
    class="flex justify-center md:justify-between items-center w-full h-[56px] text-center shrink-0 border-0 border-b-2 border-[var(--ui-primary)]"
  >
    <div class="flex">
      <UIcon
        :name="
          settingStore.sidebarOpen
            ? 'i-lucide-panel-left-close'
            : 'i-lucide-panel-left-open'
        "
        class="hidden md:block ml-6 text-[var(--ui-primary)] cursor-pointer size-6 hover:text-white"
        @click="settingStore.toggleSidebar"
      />
      <UIcon
        :name="
          settingStore.isDark
            ? 'line-md:moon-filled'
            : 'meteocons:clear-day-fill'
        "
        :class="[
          'hidden md:block ml-6 text-[var(--ui-primary)] cursor-pointer size-6 hover:text-white',
          settingStore.isDark ? 'moon-animate' : 'sun-animate',
        ]"
        @click="toggleTheme"
      />
    </div>

    <h3 class="text-2xl font-bold text-[var(--ui-primary)]">Reno ChatBox</h3>
    <localeSelectMenu class="hidden md:block mr-10" />
  </UAppHeader>
</template>
