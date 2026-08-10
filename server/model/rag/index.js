/**
 * TODO: 导入CSV，需要安装@langchain/community库，还需要额外安装一个d3-dsv库
 */
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv"
// import type { Document } from "@langchain/core/documents"

/**
 * TODO: 文档切割安装@langchain/textsplitters库
 */
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

/**
 * TODO: 加载嵌入模型（不再是ChatOpenAI去创建实例）
 */
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai"
import { HumanMessage } from "@langchain/core/messages"

/**
 * TODO: 4.文档存储（存储到内存）
 */
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
import { Document } from "@langchain/core/documents"

// 路径相关
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from "dotenv"
dotenv.config()

// 获取当前文件目录，等价于 __dirname
const __dirname = dirname(fileURLToPath(import.meta.url))

// TODO: 向量模型实例
const embedLLM = new OpenAIEmbeddings({
    modelName: process.env.NUXT_EMBEDDINGS_MODEL_NAME,
    apiKey: process.env.NUXT_EMBEDDINGS_API_KEY,
    configuration: {
        baseURL: process.env.NUXT_EMBEDDINGS_API_BASE_URL,
    }
})

// TODO: 对话模型实例化
// 对话大模型（用来生成最终答案）
const chatLLM = new ChatOpenAI({
    modelName: process.env.NUXT_MODEL_DOUBAO_SEED_LITE,
    apiKey: process.env.NUXT_API_KEY,
    configuration:{
        baseURL: process.env.NUXT_API_BASE_URL
    }
})

/**
 * TODO: 1.加载CSV文档
 */
export const loadCSVDocument = async () => {
    try {
        const csvLoader = new CSVLoader(join(__dirname, "./1.csv"))
        const csvDoc = await csvLoader.load()
        const ragSplitLengthList = csvDoc.map(item => item.pageContent.length || 0)
        const ragSplitLength = Math.max(...ragSplitLengthList)
        
        return {
            csvDoc,
            ragSplitLength
        }
    } catch (error) {
        console.error('加载文档失败:', error)
    }
}

/**
 * TODO: 2.文档切分
 */
export const splitCSVDocument = async () => {
    try {
        const { csvDoc, ragSplitLength } = await loadCSVDocument()

        const allChunks = []

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: ragSplitLength + 40,
            chunkOverlap: 0,
            separators: ["\n"]
        })
        // 逐条拆分
        for (let item of csvDoc) {
            const chunks = await splitter.splitText(item.pageContent)
            allChunks.push(...chunks)
        }
        return allChunks
    } catch (error) {
        console.error('切分文档失败:', error)
    }
}

/**
 * TODO: 3.文档向量化&&嵌入模型
 */
export const embedCSVDOcument = async () => {
    try {
        const allChunks = await splitCSVDocument()

        // // 手动生成向量
        // const embeddings = await embedLLM.embedDocuments(allChunks)

        // 自动生成向量并存储到内存中
        const vectorStore = await MemoryVectorStore.fromDocuments(
            allChunks.map(chunk => new Document({ pageContent: chunk })),
            embedLLM
        )
        
        return vectorStore
    } catch (error) {
        console.error('嵌入文档失败:', error)
    }
}

/**
 * 非流式输出
 */
const invoke = async () => {
    try {
        const vectorStore = await embedCSVDOcument()
        const vector = await embedLLM.embedQuery("NINE的信息") // 将问题向量化

        const highestMtachVector =  await (await vectorStore.similaritySearchVectorWithScore(vector, 1))[0] // 返回匹配度最高的一条消息
        console.log('highestMtachVector:', highestMtachVector)
        
        const context = highestMtachVector[0].pageContent

        const prompt = `请根据下面资料回答用户问题：
            参考资料：${context}
            用户问题：NINE的信息
        `
        console.log('prompt:', prompt)

        const answer = await chatLLM.invoke([
            new HumanMessage(prompt)
        ])

        return answer?.content || ""
    } catch (error) {
        console.error('调用模型失败:', error)
    }
}

invoke().then(res => console.log(res))