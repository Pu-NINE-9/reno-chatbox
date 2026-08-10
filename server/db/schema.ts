import { bigint, mysqlTable, timestamp, varchar, text, int } from 'drizzle-orm/mysql-core'

export const user = mysqlTable('user', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  age: int('age').notNull()
})

export const conversations = mysqlTable('conversations', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 200 }).notNull().default('新对话'),
  modelName: varchar('model_name', { length: 100 }).notNull().default('deepseek-v4-pro'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
})

export const messages = mysqlTable('messages', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  conversationId: bigint('conversation_id', { mode: 'number' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const uploadFile = mysqlTable("upload_file", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  fileName: varchar("file_name", { length: 300 }).notNull(), // 文件名
  suffix: varchar("suffix", { length: 50 }), // 后缀
  rawText: text("raw_text").notNull(), // 内容
  createdAt: timestamp("created_at").notNull().defaultNow()
})
