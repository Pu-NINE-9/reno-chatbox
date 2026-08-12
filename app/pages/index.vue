<script setup lang="ts">
import highlight from "@comark/nuxt/plugins/highlight";
import streamChat from "~/utils/sse";

const { getModelListResponse } = getResponse();

const chatStore = useChatStore();

const { t } = useI18n();

const plugins = [
  highlight("shiki", {
    themes: { light: "github-light", dark: "github-dark" },
  }),
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
}

const input = ref<string>("");
const status = ref<"submitted" | "streaming" | "ready" | "error">("ready");

const messages = computed<ChatMessage[]>({
  get: () => chatStore.messages,
  set: (val) => chatStore.setMessages(val),
});

async function onSubmit() {
  const text = input.value.trim();
  if (!text || status.value === "streaming" || status.value === "submitted") return;
  input.value = "";

  let conversationId = chatStore.currentConversationId;
  if (!conversationId) {
    conversationId = await chatStore.createConversation(modelName.value);
    if (!conversationId) {
      status.value = "error";
      return;
    }
  }

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: "user",
    parts: [{ type: "text", text }],
  };
  messages.value.push(userMsg);

  const assistantId = (Date.now() + 1).toString();
  status.value = "submitted";

  const historyMessages = messages.value
    .map((m) => ({
      role: m.role,
      content: m.parts.map((p) => p.text).join(""),
    }));

  let msg: ChatMessage | null = null;

  await streamChat.chat({
    messages: historyMessages,
    modelName: modelName.value,
    conversationId,
    onMessage: (content) => {
      if (status.value === "submitted") {
        msg = {
          id: assistantId,
          role: "assistant",
          parts: [{ type: "text", text: content }],
        };
        messages.value.push(msg);
        status.value = "streaming";
        chatStore.streaming = true;
      } else if (msg && msg.parts[0]) {
        msg.parts[0].text = content;
      }
    },
    onComplete: () => {
      if (!msg) {
        msg = {
          id: assistantId,
          role: "assistant",
          parts: [{ type: "text", text: "(空响应)" }],
        };
        messages.value.push(msg);
      }
      status.value = "ready";
      chatStore.streaming = false;
      chatStore.fetchConversations();
    },
    onError: (err) => {
      status.value = "error";
      chatStore.streaming = false;
      if (!msg) {
        msg = {
          id: assistantId,
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `调用 AI 接口失败：${err?.message || "网络异常，请稍后重试"}`,
            },
          ],
        };
        messages.value.push(msg);
      } else if (msg && msg.parts[0] && !msg.parts[0].text) {
        msg.parts[0].text = `调用 AI 接口失败：${err?.message || "网络异常，请稍后重试"}`;
      }
    },
  });
}

function onStop() {
  streamChat.abort();
  status.value = "ready";
  chatStore.streaming = false;
}

async function newChat() {
  if (status.value === "streaming" || status.value === "submitted") return;
  streamChat.abort();
  status.value = "ready";
  await chatStore.createConversation(modelName.value);
}

const modelName = ref("");
const modelList = ref<{ label: string; value: string; icon: string }[]>([]);

function getModelIcon(name: string): string {
  if (name.includes("doubao")) return "i-simple-icons-bytedance";
  if (name.includes("deepseek")) return "i-simple-icons-deepseek";
  if (name.includes("glm")) return "i-simple-icons-zhipuai";
  if (name.includes("kimi")) return "i-simple-icons-moonshotai";
  if (name.includes("minimax")) return "i-simple-icons-minimax";
  return "i-lucide-cpu";
}

const currentModelIcon = computed(() => {
  return (
    modelList.value.find((item) => item.value === modelName.value)?.icon ||
    "i-lucide-cpu"
  );
});

onMounted(async () => {
  const res = await getModelListResponse();
  if (res?.modelNames) {
    modelList.value = res.modelNames.map((name: string) => ({
      label: name,
      value: name,
      icon: getModelIcon(name),
    }));
    if (modelList.value.length > 0 && !modelName.value) {
      modelName.value = modelList.value[0].value;
    }
  }

  await chatStore.fetchConversations();

  if (chatStore.currentConversationId) {
    await chatStore.switchConversation(chatStore.currentConversationId);
  }
});

watch(
  () => chatStore.currentConversationId,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return;
    if (status.value === "streaming" || status.value === "submitted") return;
    if (chatStore.loading) return;
    if (chatStore.skipSwitch) return;
    await chatStore.switchConversation(newId);
  }
);
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <UChatMessages
      class="flex-1 min-h-0 overflow-auto pl-34 pr-34 pb-16"
      :auto-scroll="{
        size: 'lg',
        color: 'neutral',
        variant: 'outline',
      }"
      :messages="messages"
      :status="status"
      :should-auto-scroll="true"
      :should-scroll-to-bottom="true"
      :user="{
        side: 'right',
        variant: 'soft',
      }"
      :assistant="{
        side: 'left',
        variant: 'soft',
        icon: 'i-lucide-bot',
      }"
    >
      <template #content="{ message }">
        <template
          v-for="(part, index) in message.parts"
          :key="`${message.id}-${index}`"
        >
          <Comark
            v-if="message.role === 'assistant' && part.type === 'text'"
            :markdown="part.text"
            :plugins="plugins"
            streaming
            class="*:first:mt-0 *:last:mb-0"
          />
          <p
            v-else-if="part.type === 'text'"
            class="whitespace-pre-wrap leading-6"
          >
            {{ part.text }}
          </p>
        </template>
      </template>
    </UChatMessages>

    <div class="mt-10 flex justify-center align-center">
      <UChatPrompt
        v-model="input"
        icon="i-lucide-send"
        variant="naked"
        :loading="status === 'streaming' || status === 'submitted'"
        :disabled="status === 'streaming' || status === 'submitted'"
        @submit="onSubmit"
        class="shrink-0 border-2 border-[var(--ui-primary)] hover:border-white w-4/5"
      >
        <!-- 输入框下半部分区域 -->
        <template #footer>
          <div>rag预留区</div>

          <div class="flex items-center gap-1.5">
            <USelect
              v-model="modelName"
              :items="modelList"
              :icon="currentModelIcon"
              value-key="value"
              variant="ghost"
              size="sm"
              square
              :disabled="status === 'streaming' || status === 'submitted'"
            />

            <UChatPromptSubmit
              size="sm"
              :status="status"
              @submit="onSubmit"
              @stop="onStop"
              @reload="onSubmit"
            />
          </div>
        </template>
      </UChatPrompt>
    </div>
  </div>
</template>

<style scoped>
/* 样式穿透 */
:deep([data-slot="autoScroll"]) {
  bottom: 4rem !important;
}
</style>