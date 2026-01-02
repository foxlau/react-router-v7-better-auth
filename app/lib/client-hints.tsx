/**
 * Client Hints Utilities
 *
 * This module provides utilities for handling client-side preferences (timezone, theme, locale)
 * that are needed by the server but are only known by the browser. It uses cookies to bridge
 * the client-server gap and ensures SSR compatibility.
 */

import { useEffect } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { z } from "zod/v4";
import {
	useOptionalRequestInfo,
	useRequestInfo,
} from "~/hooks/use-request-info";
import { cookiePrefix } from "./config";

// ============================================================================
// Types & Schemas
// ============================================================================

export const ThemeSchema = z.object({
	theme: z.enum(["system", "light", "dark"]),
	redirectTo: z.string().optional(),
});

export type Theme = z.infer<typeof ThemeSchema>["theme"];

export interface ClientHint {
	timeZone: string;
	locale: string;
}

type ClientHintDefinition<T = string> = {
	cookieName: string;
	getValueCode: string;
	fallback: T;
	transform?: (value: string) => T;
};

// ============================================================================
// Client Hints Configuration
// ============================================================================

const THEME_COOKIE_NAME = `${cookiePrefix}.CH-prefers-color-scheme`;

const clientHints: Record<string, ClientHintDefinition> = {
	timeZone: {
		cookieName: `${cookiePrefix}.CH-time-zone`,
		getValueCode: "Intl.DateTimeFormat().resolvedOptions().timeZone",
		fallback: "UTC",
	},
	theme: {
		cookieName: THEME_COOKIE_NAME,
		getValueCode: `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`,
		fallback: "light",
	},
};

type ClientHintNames = keyof typeof clientHints;

// ============================================================================
// Internal Utilities
// ============================================================================

/**
 * Parse Accept-Language header value into an ordered array of locales
 * @internal
 */
type ParseAcceptLanguageOptions = {
	validate?: (locale: string) => string | string[] | null | undefined;
	ignoreWildcard?: boolean;
};

function parseAcceptLanguage(
	languageHeaderValue: string | null | undefined,
	options: ParseAcceptLanguageOptions = {},
): string[] {
	if (!languageHeaderValue) return [];

	const { ignoreWildcard = true, validate = (locale: string) => locale } =
		options;

	return languageHeaderValue
		.split(",")
		.map((lang): [number, string] => {
			const [locale, q = "q=1"] = lang.split(";");
			const trimmedLocale = locale?.trim() ?? "";
			const numQ = Number(q.replace(/q ?=/, ""));
			return [Number.isNaN(numQ) ? 0 : numQ, trimmedLocale];
		})
		.sort(([q1], [q2]) => q2 - q1)
		.flatMap(([_, locale]) => {
			if (locale === "*" && ignoreWildcard) return [];
			try {
				return validate(locale) || [];
			} catch {
				return [];
			}
		});
}

/**
 * Extract a specific cookie value from a cookie string
 * @internal
 */
function getCookieValue(cookieString: string, name: ClientHintNames) {
	const hint = clientHints[name];
	if (!hint) {
		throw new Error(`Unknown client hint: ${name}`);
	}

	const value = cookieString
		.split(";")
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${hint.cookieName}=`))
		?.split("=")[1];

	return value ? decodeURIComponent(value) : null;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get all client hints from cookies
 * Works in both browser and server environments
 *
 * @param request - Optional request object (server-side only)
 * @returns Object with all client hint values
 */
export function getHints(request?: Request) {
	const cookieString =
		typeof document !== "undefined"
			? document.cookie
			: typeof request !== "undefined"
				? (request.headers.get("Cookie") ?? "")
				: "";

	return Object.entries(clientHints).reduce(
		(acc, [name, hint]) => {
			const hintName = name as ClientHintNames;
			const cookieValue = getCookieValue(cookieString, hintName);

			if (hint.transform) {
				acc[hintName] = hint.transform(cookieValue ?? hint.fallback);
			} else {
				acc[hintName] = cookieValue ?? hint.fallback;
			}
			return acc;
		},
		{} as Record<ClientHintNames, string>,
	);
}

/**
 * Extract user's preferred locale from Accept-Language header
 *
 * @param request - The incoming request object
 * @returns Preferred locale string, defaults to "en-US"
 * @public
 */
export function getLocale(request: Request): string {
	const locales = parseAcceptLanguage(request.headers.get("accept-language"), {
		validate: Intl.DateTimeFormat.supportedLocalesOf,
	});

	return locales[0] ?? "en-US";
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Get client hints in React components
 * @returns Object with all client hint values
 * @public
 */
export function useHints() {
	const requestInfo = useRequestInfo();
	return requestInfo.hints;
}

/**
 * Get client hints in React components
 * @returns Object with all client hint values or undefined if no request info available
 * @public
 */
export function useOptionalHints() {
	const requestInfo = useOptionalRequestInfo();
	return requestInfo?.hints;
}

/**
 * Get current theme with optimistic updates support
 * @returns Current theme: "light" | "dark"
 * @public
 */
export function useTheme() {
	const hints = useHints();
	const requestInfo = useRequestInfo();
	const optimisticMode = useOptimisticThemeMode();

	if (optimisticMode) {
		return optimisticMode === "system" ? hints.theme : optimisticMode;
	}

	return requestInfo.userPrefs.theme ?? hints.theme;
}

/**
 * Get current theme with optional request info
 * @returns Current theme or undefined if no request info available
 * @public
 */
export function useOptionalTheme(): Theme | undefined {
	const hints = useOptionalHints();
	const optionalRequestInfo = useOptionalRequestInfo();
	const optimisticMode = useOptimisticThemeMode();

	if (optimisticMode) {
		if (optimisticMode === "system") {
			// hints.theme is "light" | "dark" (system preference)
			const systemTheme = hints?.theme;
			return systemTheme === "light" || systemTheme === "dark"
				? systemTheme
				: undefined;
		}
		return optimisticMode;
	}

	const userPrefTheme = optionalRequestInfo?.userPrefs.theme;
	if (userPrefTheme) {
		return userPrefTheme;
	}

	// hints.theme is "light" | "dark" (system preference), not "system"
	const systemTheme = hints?.theme;
	return systemTheme === "light" || systemTheme === "dark"
		? systemTheme
		: undefined;
}

/**
 * Get optimistic theme mode from pending form submissions
 * Used for immediate UI feedback before server response
 * @returns Optimistic theme mode or undefined
 * @public
 */
export function useOptimisticThemeMode() {
	const themeFetcher = useFetcher({ key: "theme-fetcher" });

	if (themeFetcher?.formData) {
		const formData = Object.fromEntries(themeFetcher.formData);
		const { theme } = ThemeSchema.parse(formData);
		return theme;
	}
}

/**
 * Subscribe to changes in the user's color scheme preference
 * Based on @epic-web/client-hints color-scheme implementation
 * @param subscriber - Callback function to handle theme changes
 * @param cookieName - Cookie name to use (defaults to CH-prefers-color-scheme)
 * @returns Cleanup function to remove the event listener
 * @public
 */
export function subscribeToSchemeChange(
	subscriber: (value: "dark" | "light") => void,
	cookieName: string = THEME_COOKIE_NAME,
) {
	if (typeof window === "undefined") return () => {};

	const schemaMatch = window.matchMedia("(prefers-color-scheme: dark)");

	function handleThemeChange() {
		const value = schemaMatch.matches ? "dark" : "light";
		// biome-ignore lint/suspicious/noDocumentCookie: Direct cookie setting is required for client hints synchronization
		document.cookie = `${cookieName}=${value}; Max-Age=31536000; SameSite=Lax; Path=/`;
		subscriber(value);
	}

	schemaMatch.addEventListener("change", handleThemeChange);

	return function cleanupSchemaChange() {
		schemaMatch.removeEventListener("change", handleThemeChange);
	};
}

// ============================================================================
// Client-Side Component
// ============================================================================

/**
 * Client-side script that checks and synchronizes client hints
 *
 * This component renders an inline script that:
 * 1. Checks if cookies can be set
 * 2. Compares actual browser values with stored cookie values
 * 3. Updates cookies if they don't match
 * 4. Reloads the page once to ensure server gets correct values
 * 5. Prevents infinite reload loops with sessionStorage counter
 * 6. Subscribes to system theme changes for real-time updates
 *
 * @param nonce - CSP nonce for inline script
 */
export function ClientHintCheck({ nonce }: { nonce?: string }) {
	const { revalidate } = useRevalidator();

	// Subscribe to system theme changes
	useEffect(() => {
		return subscribeToSchemeChange(() => {
			// Revalidate to get fresh data with updated theme
			void revalidate();
		});
	}, [revalidate]);

	const script = `!function(){if(navigator.cookieEnabled){document.cookie="canSetCookies=1; Max-Age=60; SameSite=Lax; path=/";const e=document.cookie.includes("canSetCookies=1");if(document.cookie="canSetCookies=; Max-Age=-1; path=/",e){const e=document.cookie.split(";").map(e=>e.trim()).reduce((e,t)=>{const[a,n]=t.split("=");return e[a]=n,e},{});let t=parseInt(sessionStorage.getItem("clientHintReloadAttempts")||"0");if(!(t>3)){const a=[${Object.values(
		clientHints,
	)
		.map(
			(hint) =>
				`{name:${JSON.stringify(hint.cookieName)},actual:String(${hint.getValueCode}),value:e[${JSON.stringify(hint.cookieName)}]!=null?e[${JSON.stringify(hint.cookieName)}]:encodeURIComponent(${JSON.stringify(hint.fallback)})}`,
		)
		.join(
			",",
		)}];let n=!1;for(const t of a){document.cookie=encodeURIComponent(t.name)+"="+encodeURIComponent(t.actual)+"; Max-Age=31536000; SameSite=Lax; path=/";try{decodeURIComponent(t.value)!==t.actual&&(n=!0)}catch(e){n=!0}}n?(sessionStorage.setItem("clientHintReloadAttempts",String(t+1)),document.head.appendChild(Object.assign(document.createElement("style"),{textContent:"html { visibility: hidden !important; }"})),window.location.reload()):sessionStorage.removeItem("clientHintReloadAttempts")}}}}();`;

	return (
		<script
			nonce={nonce}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: We want to run this script on the client
			dangerouslySetInnerHTML={{ __html: script }}
		/>
	);
}
