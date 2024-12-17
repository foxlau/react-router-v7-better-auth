import type { Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: "./app/database/schema.ts",
  dialect: "sqlite",
} satisfies Config;
