import type { MiddlewareFunction } from "react-router";
import { createContext, href, redirect } from "react-router";
import { safeRedirectPath } from "~/lib/safe-redirect";
import type { auth } from "~/services/auth/auth.server";

export type AuthSession = typeof auth.$Infer.Session;
export const optionalAuthContext = createContext<AuthSession | null>(null);
export const requiredAuthContext = createContext<AuthSession>();

// Attach guards to routes/layouts so React Router decides which URLs they protect.
export const requireAuthMiddleware: MiddlewareFunction = ({ url, context }) => {
	const session = context.get(optionalAuthContext);
	if (!session) {
		const safe = safeRedirectPath(url.pathname + url.search, "/");
		throw redirect(
			`${href("/auth/sign-in")}?redirectTo=${encodeURIComponent(safe)}`,
		);
	}

	context.set(requiredAuthContext, session);
};

export const guestOnlyMiddleware: MiddlewareFunction = ({ context }) => {
	if (context.get(optionalAuthContext)) {
		throw redirect(href("/"));
	}
};
