<script setup lang="ts">
const store = useLocaleStore()
</script>

<template>
  <USelectMenu
    v-model="store.language"
    value-key="id"
    :items="store.localeItems"
    @update:model-value="store.onChange"
    class="w-24 border-2 border-[var(--ui-primary)] hover:border-white"
  />
</template>
