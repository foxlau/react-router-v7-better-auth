import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { appName } from "./config";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Combine multiple headers into a single header.
 * @param headers - The headers to combine.
 * @returns The combined headers.
 */
export function combineHeaders(
	...headers: Array<ResponseInit["headers"] | null | undefined>
) {
	const combined = new Headers();

	for (const header of headers) {
		if (!header) continue;
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value);
		}
	}

	return combined;
}

/**
 * Generate a page title with app name suffix.
 * @param title - The page title. If empty, only app name is returned.
 * @returns Formatted title string.
 */
export function getPageTitle(title?: string): string {
	return title?.trim() ? `${title} • ${appName}` : appName;
}

/**
 * Parse user agent to get system and browser information.
 * @param userAgent - The user agent string.
 * @returns Object containing system, browser, and mobile information.
 */
export function parseUserAgent(userAgent: string): {
	system: string;
	browser: string;
	isMobile: boolean;
} {
	const ua = userAgent.toLowerCase();

	let system = "Unknown";
	let isMobile = false;

	if (ua.includes("android")) {
		system = "Android";
		isMobile = true;
	} else if (
		ua.includes("ios") ||
		ua.includes("iphone") ||
		ua.includes("ipad")
	) {
		system = "iOS";
		isMobile = true;
	} else if (ua.includes("windows")) {
		system = "Windows";
	} else if (ua.includes("mac os") || ua.includes("macos")) {
		system = "Macintosh";
	} else if (ua.includes("linux")) {
		system = "Linux";
	}

	const browserMatchers: {
		regex: RegExp;
		name: (match: RegExpMatchArray) => string;
	}[] = [
		{ regex: /firefox\/(\d+(\.\d+)?)/, name: (match) => `Firefox ${match[1]}` },
		{ regex: /edg\/(\d+(\.\d+)?)/, name: (match) => `Edge ${match[1]}` },
		{ regex: /chrome\/(\d+(\.\d+)?)/, name: (match) => `Chrome ${match[1]}` },
		{ regex: /safari\/(\d+(\.\d+)?)/, name: (match) => `Safari ${match[1]}` },
		{
			regex: /(opera|opr)\/(\d+(\.\d+)?)/,
			name: (match) => `Opera ${match[2]}`,
		},
	];

	let browser = "Unknown";

	for (const matcher of browserMatchers) {
		const match = ua.match(matcher.regex);
		if (
			match &&
			!(matcher.regex.source.includes("safari") && ua.includes("chrome"))
		) {
			browser = matcher.name(match);
			break;
		}
	}

	return { system, browser, isMobile };
}

/**
 * Call all functions in an array.
 * @param fns - The functions to call.
 * @returns A function that calls all the functions in the array.
 */
export function callAll<Args extends Array<unknown>>(
	...fns: Array<((...args: Args) => unknown) | undefined>
) {
	return (...args: Args) => {
		for (const fn of fns) {
			fn?.(...args);
		}
	};
}

/**
 * Get the avatar URL for a user.
 * @param userImage - The user image URL.
 * @returns The avatar URL.
 */
export function getAvatarUrl(userImage: string | null | undefined) {
	let avatarUrl = null;
	if (userImage?.startsWith("http://") || userImage?.startsWith("https://")) {
		avatarUrl = userImage;
	} else if (userImage?.startsWith("user-avatar/")) {
		avatarUrl = `/images/${userImage}`;
	}
	return {
		avatarUrl,
	};
}
