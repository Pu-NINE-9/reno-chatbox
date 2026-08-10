<script setup lang="ts">
import { uploadFileAPI } from '~/composables/uploadFile'

const { t } = useI18n()
const toast = useToast()

const uploadFile = ref<File | null>(null)
const isUploading = ref<boolean>(false)

async function handleClickUpload() {
  if (isUploading.value) return
  if (!uploadFile.value) {
    toast.add({
      title: "请先选择文件",
      color: "error",
      duration: 3000,
    })
    return
  }

  let toastId: string | number | null = null

  try {
    isUploading.value = true

    await uploadFileAPI(uploadFile.value, (status, percent) => {
      switch (status) {
        case 'start':
          // 开启上传，持久toast，不会自动关闭
          const toastRes = toast.add({
            title: '正在上传文件',
            description: '文件分片传输中…',
            icon: 'i-lucide-cloud-upload',
            color: 'info',
            duration: 0,
          })
          toastId = toastRes.id
          break

        case 'progress':
          if (toastId !== null && percent !== undefined) {
            toast.update(toastId, {
              title: `正在上传文件 ${percent}%`
            })
          }
          break

        case 'success':
          if (toastId !== null) {
            toast.update(toastId, {
              title: '✅ tus分片上传完成',
              description: '仅保存临时分片，未拷贝至public/uploads',
              icon: 'i-lucide-check',
              color: 'success',
              duration: 3500
            })
          }
          uploadFile.value = null // 清空预览图效果
          break

        case 'error':
          if (toastId !== null) {
            toast.update(toastId, {
              title: '文件上传失败！',
              description: '分片传输发生错误！',
              icon: 'i-lucide-x',
              color: 'error',
              duration: 3500
            })
          }
          break
      }
    })
  } catch (err) {
    console.error('上传出错', err)
    toast.add({
      title: '上传异常',
      color: 'error',
      duration: 3500
    })
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
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
</template>