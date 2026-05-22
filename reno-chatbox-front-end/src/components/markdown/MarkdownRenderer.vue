<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

// 配置 marked 使用 highlight.js
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value
        } catch (__) {
          return hljs.highlightAuto(code).value
        }
      }
      return hljs.highlightAuto(code).value
    },
  }),
)

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderedContent = computed(() => {
  if (!props.content) {
    return ''
  }
  try {
    return marked(props.content) as string
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return props.content
  }
})
</script>

<template>
  <div class="markdown-content" v-html="renderedContent" />
</template>

<style scoped>
.markdown-content {
  line-height: 1.8;
}

.markdown-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--border-color);
}

.markdown-content h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--border-color);
}

.markdown-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.markdown-content p {
  margin-bottom: 0.75rem;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: var(--text-secondary);
  background-color: var(--bg-card);
  padding: 0.5rem 1rem;
  border-radius: 0 0.25rem 0.25rem 0;
}

.markdown-content code {
  background-color: var(--bg-card);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.markdown-content pre {
  background-color: var(--bg-card);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.75rem;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background-color: var(--bg-card);
  font-weight: 600;
}

.markdown-content tr:nth-child(even) {
  background-color: var(--bg-card);
}

.markdown-content a {
  color: var(--accent-color);
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1rem 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

/* highlight.js 代码高亮样式覆盖 */
.markdown-content pre {
  background-color: #1e1e1e !important;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  border: 1px solid var(--border-color);
}

.markdown-content pre code {
  background-color: transparent !important;
  padding: 0 !important;
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Menlo', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #d4d4d4;
}

.markdown-content code {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #d4d4d4;
}

.markdown-content .hljs {
  background: transparent !important;
  padding: 0 !important;
}

.markdown-content .hljs-keyword,
.markdown-content .hljs-selector-tag,
.markdown-content .hljs-built_in,
.markdown-content .hljs-name,
.markdown-content .hljs-tag {
  color: #569cd6;
}

.markdown-content .hljs-string,
.markdown-content .hljs-title,
.markdown-content .hljs-section,
.markdown-content .hljs-attribute,
.markdown-content .hljs-literal,
.markdown-content .hljs-template-tag,
.markdown-content .hljs-template-variable,
.markdown-content .hljs-type,
.markdown-content .hljs-addition {
  color: #ce9178;
}

.markdown-content .hljs-comment,
.markdown-content .hljs-quote,
.markdown-content .hljs-deletion,
.markdown-content .hljs-meta {
  color: #6a9955;
  font-style: italic;
}

.markdown-content .hljs-number,
.markdown-content .hljs-regexp,
.markdown-content .hljs-literal,
.markdown-content .hljs-bullet,
.markdown-content .hljs-link {
  color: #b5cea8;
}

.markdown-content .hljs-function,
.markdown-content .hljs-title.function_ {
  color: #dcdcaa;
}

.markdown-content .hljs-variable,
.markdown-content .hljs-params {
  color: #9cdcfe;
}

.markdown-content .hljs-class .hljs-title,
.markdown-content .hljs-type {
  color: #4ec9b0;
}
</style>
