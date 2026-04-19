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
    default: '#333'
  },
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <!-- 注意：使用时必须把SVG原本的所有fill属性去除 -->
  <svg :style="`width: ${props.width}; height: ${props.height}`">
    <use :xlink:href="`#icon-${props.name}`" :fill="props.color"></use>
  </svg>
</template>

<style lang="scss" scoped>
</style>
