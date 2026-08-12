<script setup lang="ts">
import type { FileInfo } from "~~/server/api/upload/index.post";
import CSV from "~/assets/logo/CSV.png";
import MD from "~/assets/logo/MD.png";
import TXT from "~/assets/logo/TXT.png";
import DOCX from "~/assets/logo/DOCX.png";
import XLSX from "~/assets/logo/XLSX.png";
import PDF from "~/assets/logo/PDF.png";
import DEFAULT from "~/assets/logo/DEFAULT.png";

const { t } = useI18n();
const { getUploadedFilesList, deleteUploadedFile } = getResponse();
const confirm = useConfirmDialog();
const toast = useToast();

const fileList = ref<Array<FileInfo>>([]);
const uploadFile = ref<File | null>(null);
const isUploading = ref(false);

const getFileList = async () => {
  const data = await getUploadedFilesList();
  console.log(data);
  if (data) fileList.value = data;
};

onMounted(() => getFileList());

// 监听文件变化，选中文件直接弹出确认弹窗
watch(uploadFile, async (newVal) => {
  // 有文件并且当前不在上传中
  if (newVal && !isUploading.value) {
    await handleOpenConfirmWindow();
  }
});

// 上传主逻辑
const handleClickUpload = async () => {
  if (!uploadFile.value) throw new Error("No file selected");

  try {
    isUploading.value = true;
    const fd = new FormData();
    fd.append("file", uploadFile.value);
    await $fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    await getFileList();
    uploadFile.value = null;

    toast.add({
      title: "✅ Upload Success",
      description: "File uploaded successfully!",
      color: "success",
      duration: 2000,
    });
  } catch (error) {
    console.error((error as Error)?.message);
    toast.add({
      title: "❌ Upload Failed",
      description: (error as Error)?.data?.msg || "Failed to upload!",
      color: "error",
      duration: 2000,
    });
    uploadFile.value = null;
  } finally {
    isUploading.value = false;
  }
};

// 确认弹窗
const handleOpenConfirmWindow = async () => {
  const confirmed = await confirm({
    title: "Upload File",
    description: "Are you sure you want to upload this file?",
  });
  if (confirmed) {
    await handleClickUpload();
  } else {
    // 用户取消选择，清空文件
    uploadFile.value = null;
  }
};

const getFileIcon = (fileInfo: string) => {
  if (fileInfo.includes("pdf")) return PDF;
  if (fileInfo.includes("csv")) return CSV;
  if (fileInfo.includes("md")) return MD;
  if (fileInfo.includes("txt")) return TXT;
  if (fileInfo.includes("word") || fileInfo.includes("docx")) return DOCX;
  if (fileInfo.includes("xlsx")) return XLSX;
  return DEFAULT;
};

const handleDeleteFile = async (item: { id: number; filename: string }) => {
  const confirmed = await confirm({
    title: t('deleteFile'),
    description: `确定要删除 "${item.filename}" 吗？此操作不可撤销。`,
  });
  if (!confirmed) return;

  const success = await deleteUploadedFile(item.id);
  if (success) {
    toast.add({
      title: t('deleteFile'),
      description: '删除成功',
      color: 'success',
      duration: 2000,
    });
    await getFileList();
  } else {
    toast.add({
      title: t('deleteFile'),
      description: '删除失败',
      color: 'error',
      duration: 2000,
    });
  }
};

const getContextMenuItems = (item: { id: number; filename: string }) => [
  [
    {
      label: t('deleteFile'),
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => handleDeleteFile(item),
    },
  ],
];
</script>

<template>
  <div class="h-[455px] border-t-1 border-solid border-[var(--ui-primary)]">
    <ClientOnly>
      <UFileUpload
        v-model="uploadFile"
        :icon="false"
        label="RAG Knowledge Base"
        description="Drop your file here(PDF, CSV, MD, TXT, DOCX or XLSX (max. 5MB))"
        class="mb-3 cursor-pointer w-full h-[100px] upload-box"
        :file-delete="true"
        :ui="{
          label: 'text-sm',
          description: 'text-xs',
          wrapper: 'pt-0',
        }"
      />
    </ClientOnly>

    <div
      class="w-full flex flex-col border-t-1 border-solid border-[var(--ui-primary)]"
    >
      <div
        v-if="fileList.length === 0"
        class="flex flex-col items-center justify-center h-[315px] text-center"
      >
        <UIcon
          name="i-lucide-file-x"
          class="w-10 h-10 mb-3 opacity-30"
        />
        <p class="text-xs opacity-60">{{ t('noFiles') }}</p>
      </div>

      <UScrollArea
        v-else
        class="w-full h-[315px] mt-1"
        shadow
        :key="fileList.length"
        :items="fileList"
        v-slot="{ item, index }"
      >
        <UContextMenu :items="getContextMenuItems(item)">
          <UPageCard
            :variant="index % 2 === 0 ? 'soft' : 'outline'"
            class="rounded-none cursor-context-menu"
            highlight
            highlight-color="primary"
            spotlight
            spotlight-color="primary"
          >
            <div class="flex items-center gap-3">
              <img
                :src="getFileIcon(item.type ?? item.filename)"
                class="w-9 h-9 shrink-0"
              />
              <div>
                <div class="text-sm">{{ item.filename }}</div>
              </div>
            </div>
          </UPageCard>
        </UContextMenu>
      </UScrollArea>
    </div>
  </div>
</template>
