<script setup lang="ts">
const props = defineProps({
  width: {
    type: String,
    default: '16px',
  },
  height: {
    type: String,
    default: '16px',
  },
  color: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg :style="`width: ${props.width}; height: ${props.height}`">
    <use :xlink:href="`#icon-${props.name}`" :fill="props.color"></use>
  </svg>
</template>

<style lang="scss" scoped>
</style>
