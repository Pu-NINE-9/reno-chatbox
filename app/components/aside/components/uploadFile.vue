<script setup lang="ts">
import type { FileInfo } from "~~/server/api/upload/index.post"
const { t } = useI18n()
const { getUploadedFilesList } = getResponse()

// 加载文件列表
const fileList = ref<Array<FileInfo>>([])

const getFileList = async () => {
  const { data } = await getUploadedFilesList()
  console.log(data)
  if (data) fileList.value = data
}

onMounted(async () => {
  await getFileList()
})

// 文件上传逻辑
const uploadFile = ref<File | null>(null)
const isUploading = ref(false)

// 处理文件上传
const handleClickUpload = async () => {
  if (!uploadFile.value) throw new Error("No file selected")

  try {
    isUploading.value = true
    const fd = new FormData()

    fd.append("file", uploadFile.value)
    const res = await $fetch("/api/upload", {
      method: "POST",
      body: fd,
    })
    
    await getFileList() // 上传成功后重新渲染文件列表
    uploadFile.value = null // 清空
  } catch (error) {
    console.error((error as Error)?.message)
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <!-- 文件上传 -->
  <ClientOnly>
    <UFileUpload
      v-model="uploadFile"
      icon="i-lucide-image"
      label="Drop your file here"
      description="SVG, PNG, JPG or GIF (max. 2MB)"
      class="cursor-pointer w-full aspect-square border-1 border-dashed border-[var(--ui-primary)] rounded-md"
      :file-delete="true"
    />
    <UButton
      icon="lsicon:up-filled"
      class="mt-5 w-full justify-center cursor-pointer"
      :disabled="isUploading || !uploadFile"
      :loading="isUploading"
      variant="outline"
      :label="t('upload.btn')"
      @click="handleClickUpload"
    />
  </ClientOnly>

  <!-- 文件列表 -->
  <div class="w-full flex flex-col">
    <!-- 做了无限滚动 -->
    <UScrollArea
      class="w-full h-[160px] mt-4"
      shadow
      virtualize
      :key="fileList.length"
      :items="fileList"
      v-slot="{ item, index }"
    >
      <UPageCard
        :variant="index % 2 === 0 ? 'soft' : 'outline'"
        class="rounded-none"
      >
        {{ item.filename }} {{ item.suffix }}
      </UPageCard>
    </UScrollArea>
  </div>
</template>
