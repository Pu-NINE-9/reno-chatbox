/**
 * 功能流程：数据库读取文件文本 → 文档分片 → 生成向量存入内存向量库 → 相似度检索 → LLM流式问答
 * 新增功能：流式token输出 + 输出解析器 + 完整TS类型约束
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters" // 文档切片工具‑LangChain官方文本分割器
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai" // 向量嵌入模型、对话大模型
import { HumanMessage } from "@langchain/core/messages" // 对话消息结构体
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory" // 内存型向量数据库，程序关闭数据即销毁，仅适合开发测试
import { Document } from "@langchain/core/documents" // LangChain文档标准结构
import { StringOutputParser } from '@langchain/core/output_parsers' // 字符串输出解析器，提取模型纯文本
import { ChatPromptTemplate } from "@langchain/core/prompts" // 提示词模板

// Drizzle 数据库实例
import { db } from '~~/server/db/index'
import { uploadFile } from '~~/server/db/schema'

// ====================== 类型定义 ======================
/**
 * 文件元数据类型
 */
type FileMetadata = {
  fileName: string
  suffix: string
}

/**
 * RAG检索上下文结果
 */
type SearchChunk = [Document, number]

/**
 * 流式问答入参类型
 */
type RagStreamOption = {
  question: string
  topK?: number
}

// ====================== 模型初始化 ======================
/**
 * TODO: 【第一步：初始化向量嵌入模型】
 * 作用：把字符串文本转换成多维向量，用来后续相似度匹配
 * 环境变量全部读取nuxt配置文件内的.env
 */
const embedLLM: OpenAIEmbeddings = new OpenAIEmbeddings({
  modelName: process.env.NUXT_EMBEDDINGS_MODEL_NAME,
  apiKey: process.env.NUXT_EMBEDDINGS_API_KEY,
  configuration: {
    baseURL: process.env.NUXT_EMBEDDINGS_API_BASE_URL,
  }
})

/**
 * TODO: 【第二步：初始化对话大模型】
 * 用于接收检索后的知识库上下文，结合用户问题生成最终回答
 */
const chatLLM: ChatOpenAI = new ChatOpenAI({
  modelName: process.env.NUXT_MODEL_DOUBAO_SEED_LITE,
  apiKey: process.env.NUXT_API_KEY,
  configuration: {
    baseURL: process.env.NUXT_API_BASE_URL
  }
})

/**
 * 初始化字符串输出解析器
 * 作用：接收AIMessage对象，自动提取content文本，流式链路自动处理每一块token
 */
const outputParser: StringOutputParser = new StringOutputParser()

/**
 * 问答提示词模板
 */
const promptTemplate: ChatPromptTemplate = ChatPromptTemplate.fromTemplate(`
  请严格参考下面提供的知识库资料回答用户问题，不要编造资料以外的内容
  知识库参考资料：{context}
  用户现在的问题：{question}
`)

// ====================== 业务工具函数 ======================
/**
 * TODO: 从数据库读取全部已经上传解析完毕的文件
 * 将数据库记录转为 LangChain 需要的 Document 对象
 * pageContent：文件解析后的完整文本 rawText
 * metadata：附加元数据，保存文件名、后缀类型，方便调试
 */
export async function getAllFileDocuments(): Promise<Document[]> {
  const fileList = await db.select().from(uploadFile) // 查询上传文件

  // 组装成LangChain文档数组
  const documentArr: Document[] = fileList.map((item) => new Document({
    pageContent: item.rawText ?? "",
    metadata: {
      fileName: item.fileName,
      suffix: item.suffix
    } as FileMetadata
  }))
  return documentArr
}


/**
 * TODO: 文档分片函数
 * @param docs 完整的Document文档数组
 * 分片目的：超长文本不利于向量匹配，需要切割成一小段一小段
 */
export async function splitDocuments(docs: Document[]): Promise<Document[]> {
  if (docs.length === 0) return [] // 数据库没有任何上传文件，直接返回空数组

  const maxTextLength: number = Math.max(...docs.map(doc => doc.pageContent.length)) // 获取所有文档里面最长文本的字符长度，动态适配分片尺寸

  // 实例化文本分割器
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: maxTextLength + 40, // 单块文本最大长度
    chunkOverlap: 0, // 分片之间重叠字符，用来防止上下文被硬生生切断丢失信息
    separators: ["\n"] // 优先按照换行符切割
  })

  return await splitter.splitDocuments(docs) // LangChain内置批量分片API，不需要手动循环切割文本
}


/**
 * TODO: 创建内存向量数据库
 * 流程：读取数据库文件 → 文本分片 → 调用嵌入模型生成向量 → 存入内存
 * 每次调用都会重新加载一次完整知识库，保证拿到最新上传的文件
 */
export async function buildMemoryVectorStore(): Promise<MemoryVectorStore> {
  const originDocuments = await getAllFileDocuments() // 读取全部文档
  const textChunks = await splitDocuments(originDocuments) // 文本分片
  const vectorStore = await MemoryVectorStore.fromDocuments(textChunks, embedLLM) // 生成向量并且存入内存向量库

  return vectorStore
}

// ====================== 流式RAG核心入口 ======================
/**
 * TODO: RAG流式问答主方法（异步生成器，逐块返回token）
 * @param option 配置对象：用户问题、检索条数
 * @returns AsyncIterable<string> 异步字符串流
 */
export async function* ragSearchStream(option: RagStreamOption): AsyncIterable<string> {
  const { question, topK = 1 } = option
  const vectorStore = await buildMemoryVectorStore() // 初始化向量知识库

  // 根据用户问题进行向量相似度查询
  // 返回格式 [[Document,相似度分数],[Document,相似度分数]]
  const searchResult: SearchChunk[] = await vectorStore.similaritySearchWithScore(question, topK)

  // 没有匹配到知识库内容，直接返回提示文字
  if (!searchResult || searchResult.length <= 0) {
    yield "当前知识库内没有查找到和问题相关的资料"
    return
  }

  // 将多条检索片段拼接成一份完整上下文
  const contextText: string = searchResult.map(item => item[0].pageContent).join("\n\n")

  // LCEL链路：提示词模板 → 大模型 → 输出解析器
  const chain = promptTemplate.pipe(chatLLM).pipe(outputParser)

  // astream 异步流式获取每一段token碎片
  const stream = await chain.stream({
    context: contextText,
    question: question
  })

  // 循环推送每一块文字
  for await (const token of stream) if (token.trim() !== '') yield token
}
