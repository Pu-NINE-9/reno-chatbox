import { defineConfig } from 'drizzle-kit'

const config = useRuntimeConfig()

export default defineConfig({
  dialect: 'mysql',
  schema: './server/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    host: config.db.host,
    port: Number(config.db.port),
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
  }
})
