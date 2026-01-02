import { appName } from "~/lib/config";

/*
 * NOTE:
 * All runtime env vars should come from `cloudflare:workers`.
 * `process.env.NODE_ENV` is used only for build-time compatibility
 * (e.g. `pnpm auth:generate`).
 */

export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";

export function getClientEnv() {
	return {
		APP_NAME: appName,
	} as const;
}
