import type { Config } from 'drizzle-kit'

export default {
  schema: './app/services/db/schema',
  out: './drizzle/migrations',
  dialect: 'sqlite',
} satisfies Config
