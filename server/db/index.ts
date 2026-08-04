import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'

// 读取配置
const config = useRuntimeConfig()

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  // 连接池优化配置
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  // 超时设置
  connectTimeout: 10000
})
// 测试数据库连接
pool
  .getConnection()
  .then((connect) => {
    console.log('✅ 数据库连接成功！')
    connect.release()
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败：', err.message)
  })
export const db = drizzle(pool, {
  schema,
  mode: 'default'
})
