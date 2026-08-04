// TODO: 数据表定义
import { bigint, mysqlTable, timestamp, varchar, text, int } from 'drizzle-orm/mysql-core'

// 用户表示例
export const user = mysqlTable('user', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  age: int('age').notNull()
})
