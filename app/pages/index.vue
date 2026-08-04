<script setup lang="ts">
import { fetchEventSource } from '@microsoft/fetch-event-source'
import highlight from '@comark/nuxt/plugins/highlight'

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
let abortController: AbortController | null = null

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
  abortController = new AbortController()
  let fullContent = ''

  const historyMessages = messages.value
    .filter((m) => m.id !== 'init' && m.id !== assistantId)
    .map((m) => ({
      role: m.role,
      content: m.parts.map((p) => p.text).join('')
    }))

  try {
    await fetchEventSource('/api/ai/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify({ messages: historyMessages }),
      signal: abortController.signal,
      openWhenHidden: true,

      onopen: async (response) => {
        if (!response.ok) {
          throw new Error(`请求失败 ${response.status}`)
        }
      },

      onmessage: (event) => {
        try {
          const data = JSON.parse(event.data)
          if (event.event === 'message' && data.content) {
            fullContent += data.content
            const msg = messages.value.find((m) => m.id === assistantId)
            if (msg && msg.parts[0]) {
              msg.parts[0].text = fullContent
            }
          } else if (event.event === 'error') {
            const msg = messages.value.find((m) => m.id === assistantId)
            if (msg && msg.parts[0]) {
              msg.parts[0].text = `请求失败：${data.msg || '未知错误'}`
            }
            status.value = 'error'
          }
        } catch (e) {
          console.warn('SSE parse error:', e)
        }
      },

      onclose: () => {
        if (status.value === 'streaming') {
          status.value = 'ready'
        }
        abortController = null
      },

      onerror: (err) => {
        status.value = 'error'
        abortController = null
        const msg = messages.value.find((m) => m.id === assistantId)
        if (msg && msg.parts[0] && !msg.parts[0].text) {
          msg.parts[0].text = `调用 AI 接口失败：${err?.message || '网络异常'}`
        }
        console.error('SSE error:', err)
        throw err
      }
    })
  } catch (err: any) {
    status.value = 'error'
    abortController = null
    const msg = messages.value.find((m) => m.id === assistantId)
    if (msg && msg.parts[0] && !msg.parts[0].text) {
      msg.parts[0].text = `调用 AI 接口失败：${err?.message || '网络异常，请稍后重试'}`
    }
  }
}
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

    <UChatPalette class="shrink-0" style="flex: none">
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
