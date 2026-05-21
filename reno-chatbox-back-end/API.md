# Reno Chatbox Backend API Documentation

## 环境要求

- **Node.js**: `^20.19.0 || >=22.12.0`
- **pnpm**: 推荐使用 pnpm 或 npm

## 快速开始

```bash
# 进入后端目录
cd reno-chatbox-back-end

# 安装依赖
pnpm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 填入以下密钥：
# - DEEPSEEK_API_KEY: DeepSeek API 密钥
# - OPENAI_API_KEY: OpenAI API 密钥（用于 RAG 文本嵌入）
# - API_KEY: 自定义 API 密钥（用于接口认证）

# 开发模式运行（tsx 直接运行 TS）
pnpm dev

# 生产模式构建和运行
pnpm build
pnpm start
```

## 认证方式

所有 `/api/*` 接口都需要通过以下方式进行认证：

**Header**: `X-API-Key: your_api_key_here`

## 接口列表

### 1. 健康检查

**GET** `/health`

健康检查接口，不需要认证。

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600.5
}
```

---

### 2. 聊天接口

**POST** `/api/chat`

与 DeepSeek 进行对话。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "messages": [
    { "role": "system", "content": "你是一个有帮助的助手" },
    { "role": "user", "content": "你好，请介绍一下自己" }
  ],
  "temperature": 0.7,
  "maxTokens": 4096,
  "useRag": false,
  "ragTopK": 5
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| messages | array | 是 | - | 消息列表 |
| messages[].role | string | 是 | - | 角色: system/user/assistant |
| messages[].content | string | 是 | - | 消息内容 |
| temperature | number | 否 | 0.7 | 温度参数 (0-2) |
| maxTokens | number | 否 | 4096 | 最大 token 数 |
| useRag | boolean | 否 | false | 是否启用 RAG 检索 |
| ragTopK | number | 否 | 5 | RAG 检索返回数量 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "content": "你好！我是...",
    "usage": {
      "promptTokens": 50,
      "completionTokens": 100,
      "totalTokens": 150
    }
  },
  "ragUsed": false,
  "contextDocsCount": 0
}
```

---

### 3. 流式聊天

**POST** `/api/chat/stream`

流式输出对话响应（使用 SSE）。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**: 同 `/api/chat`

**响应格式** (SSE):
```
data: {"content": "你好"}

data: {"content": "！"}

data: [DONE]
```

---

### 4. 上传文件到 RAG

**POST** `/api/rag/upload`

上传文件进行索引和检索。

**Headers**:
```
Content-Type: multipart/form-data
X-API-Key: your_api_key_here
```

**表单字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 上传的文件 |

**支持的文件类型**:
- `.txt` - 文本文件
- `.md` - Markdown 文件
- `.csv` - CSV 文件
- `.pdf` - PDF 文档
- `.docx` - Word 文档

**文件大小限制**: 50MB

**响应示例**:
```json
{
  "success": true,
  "data": {
    "fileId": "uuid-xxxx-xxxx",
    "fileName": "document.pdf",
    "chunkCount": 15,
    "fileSize": 1024000
  }
}
```

---

### 5. 列出已上传文件

**GET** `/api/rag/files`

列出所有已上传到 RAG 系统的文件。

**Headers**:
```
X-API-Key: your_api_key_here
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxxx-xxxx",
      "fileName": "document.pdf",
      "fileType": "application/pdf",
      "chunkCount": 15,
      "fileSize": 1024000,
      "uploadTime": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### 6. 获取文件信息

**GET** `/api/rag/files/:fileId`

获取特定文件的详细信息。

**Headers**:
```
X-API-Key: your_api_key_here
```

**路径参数**:
- `fileId`: 文件 ID (UUID)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxxx-xxxx",
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "chunkCount": 15,
    "fileSize": 1024000,
    "uploadTime": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 7. 删除文件

**DELETE** `/api/rag/files/:fileId`

从 RAG 系统中删除文件。

**Headers**:
```
X-API-Key: your_api_key_here
```

**路径参数**:
- `fileId`: 文件 ID (UUID)

**响应示例**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### 8. 检索相关文档

**POST** `/api/rag/retrieve`

根据查询检索相关文档片段。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "query": "查找关于 Python 编程的内容",
  "topK": 5
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| query | string | 是 | - | 查询文本 |
| topK | number | 否 | 5 | 返回结果数量 (最大20) |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "query": "查找关于 Python 编程的内容",
    "results": [
      "Python 是一种高级编程语言...",
      "Python 支持多种编程范式..."
    ],
    "count": 2
  }
}
```

---

### 9. 获取 RAG 统计信息

**GET** `/api/rag/stats`

获取 RAG 系统的统计信息。

**Headers**:
```
X-API-Key: your_api_key_here
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalDocuments": 150,
    "totalFiles": 10,
    "files": [...]
  }
}
```

---

### 10. 保存 RAG 索引

**POST** `/api/rag/save`

将 RAG 索引保存到文件。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "filePath": "/path/to/save/index.json"
}
```

---

### 11. 加载 RAG 索引

**POST** `/api/rag/load`

从文件加载 RAG 索引。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "filePath": "/path/to/load/index.json"
}
```

---

### 12. 字符串解析

**POST** `/api/parse`

解析不同格式的字符串。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "type": "json",
  "data": "{\"name\": \"John\", \"age\": 30}",
  "options": {
    "strict": true,
    "fields": ["name", "age"]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 解析类型: json/xml/csv/markdown/plain |
| data | string | 是 | 待解析的字符串 |
| options.strict | boolean | 否 | 严格模式 (默认 true) |
| options.fields | array | 否 | CSV 解析时指定字段 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "name": "John",
    "age": 30
  },
  "format": "json"
}
```

---

### 13. 验证字符串格式

**POST** `/api/parse/validate`

验证字符串是否符合指定格式（不返回解析结果）。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "type": "json",
  "data": "{\"name\": \"John\"}"
}
```

**响应示例**:
```json
{
  "success": true,
  "format": "json",
  "error": null
}
```

---

### 14. 批量解析

**POST** `/api/parse/batch`

批量解析多个字符串。

**Headers**:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**请求体**:
```json
{
  "items": [
    { "type": "json", "data": "{\"a\": 1}" },
    { "type": "json", "data": "{\"b\": 2}" }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "results": [
      { "index": 0, "success": true, "data": { "a": 1 }, "format": "json" },
      { "index": 1, "success": true, "data": { "b": 2 }, "format": "json" }
    ],
    "total": 2,
    "successCount": 2,
    "failureCount": 0
  }
}
```

---

## 错误响应格式

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### 常见错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | VALIDATION_ERROR | 请求参数验证失败 |
| 400 | NO_FILE | 未上传文件 |
| 401 | MISSING_API_KEY | 缺少 API 密钥 |
| 403 | INVALID_API_KEY | API 密钥无效 |
| 413 | - | 请求体过大 |
| 500 | CONFIG_ERROR | 服务器配置错误 |
| 500 | - | 服务器内部错误 |

---

## 前端对接示例

### 使用 fetch

```typescript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '你好' }
    ]
  })
});

const data = await response.json();
console.log(data.data.content);
```

### 使用 axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});

const response = await api.post('/api/chat', {
  messages: [
    { role: 'user', content: '你好' }
  ]
});
```
