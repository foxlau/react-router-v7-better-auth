import type { Config } from 'drizzle-kit'

export default {
  schema: './app/db/schema',
  out: './drizzle/migrations',
  dialect: 'sqlite',
} satisfies Config
