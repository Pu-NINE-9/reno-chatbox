<script setup lang="ts">
const chatStore = useChatStore()
const { t } = useI18n()
const confirm = useConfirmDialog()
const toast = useToast()

const confirmingId = ref<number | null>(null)
const expandingId = ref<number | null>(null)
const creating = ref(false)

const menuItems = computed(() => {
  return chatStore.conversations.map((conv) => ({
    id: conv.id,
    label: conv.title || t('newChat'),
    icon: 'i-lucide-message-square',
    active: conv.id === chatStore.currentConversationId,
    updatedAt: conv.updatedAt
  }))
})

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return t('time.justNow')
    if (diffMin < 60) return `${diffMin}${t('time.minutesAgo')}`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}${t('time.hoursAgo')}`

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const daysDiff = Math.floor((todayStart.getTime() - dStart.getTime()) / 86400000)
    if (daysDiff === 1) return t('time.yesterday')
    if (daysDiff < 7) return `${daysDiff}${t('time.daysAgo')}`

    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } catch {
    return ''
  }
}

async function handleSelect(item: { id: number }) {
  if (!chatStore.canSwitchConversation) return
  if (item.id === chatStore.currentConversationId) return
  confirmingId.value = null
  expandingId.value = item.id
  try {
    await chatStore.switchConversation(item.id)
  } finally {
    expandingId.value = null
  }
}

async function handleNew() {
  if (!chatStore.canSwitchConversation || creating.value) return

  const confirmed = await confirm({
    title: t('newChat'),
    description: '确定要创建一个新的对话吗？'
  })
  if (!confirmed) return

  creating.value = true
  try {
    const newId = await chatStore.createConversation('')
    if (newId) {
      toast.add({
        title: t('newChat'),
        description: '创建成功',
        color: 'success',
        duration: 2000
      })
    } else {
      toast.add({
        title: t('newChat'),
        description: '创建失败',
        color: 'error',
        duration: 2000
      })
    }
  } finally {
    creating.value = false
  }
}

function handleDelete(id: number) {
  if (!chatStore.canSwitchConversation) return
  if (confirmingId.value === id) {
    confirmingId.value = null
    chatStore.deleteConversation(id)
    return
  }
  confirmingId.value = id
}

onMounted(async () => {
  await chatStore.fetchConversations()
})
</script>

<template>
  <div class="w-full flex-1 flex flex-col min-h-0">
    <div class="p-2 border-b border-[var(--ui-border)]">
      <UButton
        color="primary"
        variant="soft"
        size="sm"
        block
        icon="i-lucide-plus"
        :loading="creating"
        @click="handleNew"
      >
        {{ t('newChat') }}
      </UButton>
    </div>

    <div class="flex-1 overflow-auto p-2 space-y-1">
      <template v-if="menuItems.length > 0">
        <div
          v-for="item in menuItems"
          :key="item.id"
          class="group relative rounded-md transition-colors cursor-pointer select-none"
          :class="[
            item.active
              ? 'bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]'
              : 'hover:bg-[var(--ui-border)]/40 text-[var(--ui-text)]'
          ]"
          :title="item.label"
          @click="handleSelect(item)"
        >
          <div
            class="flex items-center justify-between w-full px-2 py-1.5 gap-2"
            :class="expandingId === item.id ? 'opacity-60 pointer-events-none' : ''"
          >
            <div class="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
              <UIcon
                :name="item.icon"
                class="shrink-0 w-4 h-4"
                :class="item.active ? 'text-[var(--ui-primary)]' : ''"
              />
              <div class="flex flex-col overflow-hidden flex-1">
                <span
                  class="truncate text-sm leading-tight"
                  :class="item.active ? 'font-medium' : ''"
                >
                  {{ item.label }}
                </span>
                <span v-if="item.updatedAt" class="truncate text-[10px] opacity-60 leading-tight">
                  {{ formatTime(item.updatedAt) }}
                </span>
              </div>
            </div>

            <UButton
              v-if="confirmingId === item.id"
              size="xs"
              variant="solid"
              color="error"
              icon="i-lucide-check"
              class="shrink-0"
              aria-label="confirm-delete"
              @click.stop="handleDelete(item.id)"
            />
            <UButton
              v-else
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="delete"
              @click.stop="handleDelete(item.id)"
            />
          </div>

          <div
            v-if="confirmingId === item.id"
            class="absolute inset-0 rounded-md pointer-events-none border border-[var(--ui-error)]/40 animate-pulse"
          />
        </div>
      </template>

      <div
        v-else
        class="flex flex-col items-center justify-center h-full text-center p-4"
      >
        <UIcon
          name="i-lucide-message-square"
          class="w-10 h-10 mb-3 opacity-30"
        />
        <p class="text-xs opacity-60">{{ t('noConversations') }}</p>
      </div>
    </div>
  </div>
</template>
