import { cache } from "react";
import type { MiddlewareFunction } from "react-router";
import { createContext, href, redirect } from "react-router";
import { safeRedirectPath } from "~/lib/safe-redirect";
import { auth } from "~/services/auth/auth.server";

// Protected routes
const PROTECTED_ROUTES = ["/admin", "/settings", "/todos"] as const;

// Guest only routes
const GUEST_ONLY_ROUTES = ["/auth/sign-in", "/auth/sign-up"] as const;

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isGuestOnlyRoute(pathname: string): boolean {
	return GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

export type AuthSession = typeof auth.$Infer.Session;
export const optionalAuthContext = createContext<AuthSession | null>(null);
export const requiredAuthContext = createContext<AuthSession>();

export const getSession = cache(async (request: Request) => {
	return await auth.api.getSession({
		headers: request.headers,
	});
});

export const authMiddleware: MiddlewareFunction = async (
	{ request, context },
	next,
) => {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const session = await getSession(request);

	// 1. Guest only routes
	if (isGuestOnlyRoute(pathname)) {
		if (session) {
			throw redirect(href("/"));
		}
		context.set(optionalAuthContext, null);
		return next();
	}

	// 2. Protected routes
	if (isProtectedRoute(pathname)) {
		if (!session) {
			const fullPath = pathname + url.search;
			const safe = safeRedirectPath(fullPath, "/");
			const redirectTo = encodeURIComponent(safe);
			throw redirect(`${href("/auth/sign-in")}?redirectTo=${redirectTo}`);
		}
		context.set(optionalAuthContext, session);
		context.set(requiredAuthContext, session); // Ensure not null
		return next();
	}

	// 3. Public routes
	context.set(optionalAuthContext, session); // May be null
	return next();
};
