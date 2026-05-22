<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  code: string
  language?: string
}>()

const copied = ref(false)

const language = computed(() => props.language || 'plaintext')

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const getLanguageClass = () => {
  const langMap: Record<string, string> = {
    javascript: 'lang-js',
    js: 'lang-js',
    typescript: 'lang-ts',
    ts: 'lang-ts',
    python: 'lang-py',
    py: 'lang-py',
    java: 'lang-java',
    go: 'lang-go',
    rust: 'lang-rust',
    c: 'lang-c',
    cpp: 'lang-cpp',
    csharp: 'lang-csharp',
    cs: 'lang-csharp',
    php: 'lang-php',
    ruby: 'lang-ruby',
    rb: 'lang-ruby',
    html: 'lang-html',
    css: 'lang-css',
    json: 'lang-json',
    yaml: 'lang-yaml',
    sql: 'lang-sql',
    shell: 'lang-shell',
    bash: 'lang-bash',
    dockerfile: 'lang-docker',
    markdown: 'lang-md',
    xml: 'lang-xml',
  }
  return langMap[language.value.toLowerCase()] || 'lang-plain'
}
</script>

<template>
  <div class="code-block-wrapper">
    <div class="code-header">
      <span class="language-label">{{ language }}</span>
      <button 
        class="copy-btn" 
        @click="copyCode"
        :class="{ copied: copied }"
      >
        <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    <pre class="code-content"><code :class="getLanguageClass()">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block-wrapper {
  background: var(--bg-secondary, #1e1e1e);
  border-radius: 8px;
  overflow: hidden;
  margin: 0.5em 0;
  border: 1px solid var(--border-color, #333);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-tertiary, #2d2d2d);
  border-bottom: 1px solid var(--border-color, #333);
}

.language-label {
  font-size: 12px;
  color: var(--text-secondary, #888);
  font-weight: 500;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--primary-color, #4f46e5);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--primary-hover, #4338ca);
}

.copy-btn.copied {
  background: #10b981;
}

.code-content {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color, #e4e4e7);
  white-space: pre;
}

.lang-js .keyword { color: #ff79c6; }
.lang-js .string { color: #f1fa8c; }
.lang-js .number { color: #bd93f9; }
.lang-js .comment { color: #6272a4; font-style: italic; }
.lang-js .function { color: #50fa7b; }
.lang-js .class { color: #8be9fd; }

.lang-ts .keyword { color: #ff79c6; }
.lang-ts .string { color: #f1fa8c; }
.lang-ts .number { color: #bd93f9; }
.lang-ts .comment { color: #6272a4; font-style: italic; }
.lang-ts .function { color: #50fa7b; }
.lang-ts .class { color: #8be9fd; }
.lang-ts .generic { color: #ffb86c; }

.lang-py .keyword { color: #ff79c6; }
.lang-py .string { color: #f1fa8c; }
.lang-py .number { color: #bd93f9; }
.lang-py .comment { color: #6272a4; font-style: italic; }
.lang-py .function { color: #50fa7b; }
.lang-py .class { color: #8be9fd; }

.lang-html .tag { color: #ff79c6; }
.lang-html .attr { color: #50fa7b; }
.lang-html .string { color: #f1fa8c; }

.lang-css .selector { color: #ff79c6; }
.lang-css .property { color: #50fa7b; }
.lang-css .value { color: #f1fa8c; }

.lang-json .key { color: #ff79c6; }
.lang-json .string { color: #f1fa8c; }
.lang-json .number { color: #bd93f9; }
.lang-json .boolean { color: #bd93f9; }

.lang-sql .keyword { color: #ff79c6; }
.lang-sql .string { color: #f1fa8c; }
.lang-sql .number { color: #bd93f9; }

.lang-shell .command { color: #50fa7b; }
.lang-shell .arg { color: #f1fa8c; }
.lang-shell .comment { color: #6272a4; }
</style>