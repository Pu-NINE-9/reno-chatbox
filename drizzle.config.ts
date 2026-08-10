import { defineConfig } from 'drizzle-kit'
import dotenv from "dotenv"
dotenv.config()

export default defineConfig({
  dialect: 'mysql',
  schema: './server/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    host: process.env.NUXT_DB_HOST,
    port: Number(process.env.NUXT_DB_PORT),
    user: process.env.NUXT_DB_USER,
    password: process.env.NUXT_DB_PASSWORD,
    database: process.env.NUXT_DB_DATABASE
  }
})
