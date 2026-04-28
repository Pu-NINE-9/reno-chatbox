<script setup lang="ts">
import layout from './layout/index.vue'

// 测试 XSS 恶意代码
const testXss =
  '<img src=1 onerror=alert("XSS攻击")>' +
  '<' + '/script> document.cookie' // 这里拆开，不报错
</script>

<template>
  <div v-anti-debug v-anti-capture >
    <div style="margin: 10px 0;">
      <p>👉 v-xss 指令渲染：</p>
      <div v-xss="testXss" style="padding:10px;border:1px solid #eee;"></div>
    </div>
    <layout />
  </div>
</template>

<style lang="scss" scoped>
</style>
