<script setup lang="ts">
import highlight from '@comark/nuxt/plugins/highlight'
import streamChat from '~/utils/sse'

const { getModelListResponse } = getResponse()

const { t } = useI18n()

// 初始化插件，配置明暗主题（和 Nuxt UI color-mode 自动同步）
const plugins = [
  highlight('shiki', {
    themes: { light: 'github-light', dark: 'github-dark' }
  })
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: Array<{ type: 'text'; text: string }>
}

const input = ref<string>('')
const messages = ref<ChatMessage[]>([
  {
    id: 'init',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: t('hello')
      }
    ]
  }
])
const status = ref<'streaming' | 'ready' | 'error'>('ready')

async function onSubmit() {
  const text = input.value.trim()
  if (!text || status.value === 'streaming') return
  input.value = ''

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    parts: [{ type: 'text', text }]
  }
  messages.value.push(userMsg)

  const assistantId = (Date.now() + 1).toString()
  const assistantMsg: ChatMessage = {
    id: assistantId,
    role: 'assistant',
    parts: [{ type: 'text', text: '' }]
  }
  messages.value.push(assistantMsg)

  status.value = 'streaming'

  const historyMessages = messages.value
    .filter((m) => m.id !== 'init' && m.id !== assistantId)
    .map((m) => ({
      role: m.role,
      content: m.parts.map((p) => p.text).join('')
    }))

  const msg = messages.value.find((m) => m.id === assistantId)

  await streamChat.chat({
    messages: historyMessages,
    modelName: modelName.value,
    onMessage: (content) => {
      if (msg && msg.parts[0]) {
        msg.parts[0].text = content
      }
    },
    onComplete: () => {
      if (status.value === 'streaming') {
        status.value = 'ready'
      }
    },
    onError: (err) => {
      status.value = 'error'
      if (msg && msg.parts[0] && !msg.parts[0].text) {
        msg.parts[0].text = `调用 AI 接口失败：${err?.message || '网络异常，请稍后重试'}`
      }
    }
  })
}

const modelName = ref('')
const modelList = ref<{ label: string; value: string }[]>([])

onMounted(async () => {
  const res = await getModelListResponse()
  if (res?.modelNames) {
    modelList.value = res.modelNames.map((name: string) => ({ label: name, value: name }))
    if (modelList.value.length > 0 && !modelName.value) {
      modelName.value = modelList.value[0].value
    }
  }
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <UChatMessages
      class="flex-1 min-h-0 overflow-auto pl-34 pr-34"
      :auto-scroll="{
        size: 'lg',
        color: 'neutral',
        variant: 'outline'
      }"
      :messages="messages"
      :status="status"
      :should-auto-scroll="true"
      :should-scroll-to-bottom="true"
      :user="{
        side: 'right',
        variant: 'soft'
      }"
      :assistant="{
        side: 'left',
        variant: 'soft',
        icon: 'i-lucide-bot'
      }"
    >
      <template #content="{ message }">
        <template v-for="(part, index) in message.parts" :key="`${message.id}-${index}`">
          <Comark
            v-if="message.role === 'assistant' && part.type === 'text'"
            :markdown="part.text"
            :plugins="plugins"
            streaming
            class="*:first:mt-0 *:last:mb-0"
          />
          <p v-else-if="part.type === 'text'" class="whitespace-pre-wrap leading-6">
            {{ part.text }}
          </p>
        </template>
      </template>
    </UChatMessages>

    <!-- 输入框整体区域 -->
    <UChatPalette class="shrink-0" style="flex: none">
      
      <!-- 模型列表 -->
      <div class="flex justify-center w-full">
        <USelectMenu
          v-model="modelName"
          value-key="value"
          :items="modelList"
          placeholder="请选择模型"
          class="w-4/5"
        />
      </div>
      
      <!-- 输入框区域 -->
      <template #prompt>
        <div class="flex justify-center w-full">
          <div class="flex w-4/5 align-center justify-center">
            <UChatPrompt
              v-model="input"
              icon="i-lucide-send"
              variant="naked"
              :loading="status === 'streaming'"
              @submit="onSubmit"
            />
            <UChatPromptSubmit
              color="primary"
              class="hover:cursor-pointer"
              variant="solid"
              icon="i-lucide-arrow-up"
              @click="onSubmit"
            />
          </div>
        </div>
      </template>
    </UChatPalette>
  </div>
</template>
