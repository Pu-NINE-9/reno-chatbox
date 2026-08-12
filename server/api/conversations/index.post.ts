import { successAPI, failAPI } from '~~/server/utils/response'
import { conversations, messages } from '~~/server/db/schema'
import { db } from '~~/server/db'
import { desc } from 'drizzle-orm'

const WELCOME_MESSAGE = "What's up~欢迎来到我们的Reno Chatbox，我是由Pu NINE开发的一款聊天助手，你可以和我进行任何的talk哦！我上知天文下知地理、无所不能嘿嘿唔嘿~"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const title = body?.title || '新对话'
    const modelName = body?.modelName || 'deepseek-v4-pro'

    await db
      .insert(conversations)
      .values({ title, modelName })
      .execute()

    const [latest] = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.id))
      .limit(1)
      .execute()

    if (!latest) {
      return failAPI(event, '创建对话失败：未获取到ID')
    }

    const convId = Number(latest.id)

    try {
      await db.insert(messages).values({
        conversationId: convId,
        role: 'assistant',
        content: WELCOME_MESSAGE
      }).execute()
    } catch (msgErr) {
      console.error('⚠️ 欢迎消息插入失败（不影响对话创建）：', (msgErr as Error).message)
    }

    return successAPI({ id: convId, title, modelName }, '创建对话成功', event)
  } catch (err) {
    console.error('❌ 创建对话失败：', (err as Error).message)
    return failAPI(event, (err as Error).message || '创建对话失败')
  }
})
