import type { MiddlewareFunction } from "react-router";
import { redirect } from "react-router";

/**
 * Remove trailing slash middleware (Trim Trailing Slash Middleware)
 *
 * Redirect URLs with trailing slashes to versions without slashes to achieve URL normalization.
 * For example: `/about/` will be permanently redirected to `/about`;
 * Note: Root path `/` (pathname === "/") will not be processed;
 *
 * @returns React Router middleware function
 */
export const trimTrailingSlash: MiddlewareFunction = ({ request }, next) => {
	const method = request.method;
	const url = new URL(request.url);
	const { pathname, search, hash } = url;

	// If path is not root and ends with slash
	if (
		(method === "GET" || method === "HEAD") &&
		pathname !== "/" &&
		pathname.endsWith("/")
	) {
		// Remove trailing slash
		const newPathname = pathname.slice(0, -1);
		const newUrl = `${newPathname}${search}${hash}`;

		// Use 308 (Permanent Redirect) is a more strict permanent redirect,
		// It ensures that the request method is preserved even if it is not GET/HEAD.
		// In this scenario, 301 can also be used, but 308 is the modern recommended做法。
		throw redirect(newUrl, 308);
	}

	return next();
};

/**
 * Add trailing slash middleware (Append Trailing Slash Middleware)
 *
 * If URL does not have a trailing slash, redirect to the version with a slash.
 * For example: `/about` will be permanently redirected to `/about/`
 *
 * Note:
 * 1. Root path `/` (pathname === "/") will not be processed.
 * 2. Paths with file extensions will not be processed (e.g. `/file.pdf`).
 * 3. This middleware cannot be used with trimTrailingSlash middleware, otherwise it will cause an infinite redirect loop.
 *
 * @returns React Router middleware function
 */
export const appendTrailingSlash: MiddlewareFunction = async (
	{ request },
	next,
) => {
	const method = request.method;
	const url = new URL(request.url);
	const { pathname, search, hash } = url;

	// 1. Check if there is a file extension (e.g. .html, .css, .jpg)
	// Regular expression ensures that the dot is followed by at least one non-dot, non-slash character until the string or question mark/hash mark is reached.
	const hasFileExtension = /\.[^./]+$/.test(pathname);

	// 2. Only redirect for idempotent methods (GET, HEAD) to avoid affecting POST/PUT request data
	// 3. Check: not root path, not ending with slash, and no file extension
	if (
		(method === "GET" || method === "HEAD") &&
		pathname !== "/" &&
		!pathname.endsWith("/") &&
		!hasFileExtension
	) {
		// Add trailing slash
		const newUrl = `${pathname}/${search}${hash}`;

		throw redirect(newUrl, 308);
	}

	return next();
};
