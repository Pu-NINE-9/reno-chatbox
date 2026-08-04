<script setup lang="ts">
// assets下图片必须导入
import logoImg from '~/assets/img/website-slogan.png'
</script>

<template>
  <div class="flex items-center justify-center w-full h-[100px]">
    <img
      title="Reno ChatBox"
      :src="logoImg"
      alt="Reno ChatBox"
      height="80"
      width="160"
      class="cursor-pointer"
    />
  </div>
</template>
