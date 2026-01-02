import type { FC, SVGProps } from "react";
import { GithubIcon, GoogleIcon } from "~/components/icons";

export const appName = "React Router x Better Auth";
export const cookiePrefix = appName
	.toLowerCase()
	.replace(/[^a-z\s]/g, "")
	.replace(/\s+/g, "-");
export const appDescription =
	"This is a template that can be deployed on Cloudflare Workers, built with React Router v7 (Remix), Better Auth, Drizzle ORM, and D1.";

/**
 * Social provider configs
 */
// 1. social provider configs (note: this provider configuration should be synchronized with `~/lib/auth/auth.server.ts`)
export const SOCIAL_PROVIDER_CONFIGS = [
	{
		id: "github",
		name: "GitHub",
		icon: GithubIcon,
	},
	{
		id: "google",
		name: "Google",
		icon: GoogleIcon,
	},
] as const;

// 2. Derive type from configs
export type AllowedProvider = (typeof SOCIAL_PROVIDER_CONFIGS)[number]["id"];
export type SocialProviderConfig = {
	id: AllowedProvider;
	name: string;
	icon: FC<SVGProps<SVGSVGElement>>;
};

// 3. Use z.enum needed string tuple format
// This approach is closest to the original code's intent and solves the type issue
export const ALLOWED_PROVIDERS = [
	SOCIAL_PROVIDER_CONFIGS[0].id,
	...SOCIAL_PROVIDER_CONFIGS.slice(1).map((config) => config.id),
] as const;
