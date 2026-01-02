import { env as cloudflareEnv } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/drizzle/schema";
import { isDevelopment } from "./env.server";

export const db = drizzle(cloudflareEnv.DB, {
	schema,
	logger: isDevelopment,
});
