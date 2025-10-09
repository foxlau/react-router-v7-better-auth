import { AsyncLocalStorage } from "node:async_hooks";
import type { MiddlewareFunction, RouterContextProvider } from "react-router";
import { createContext, href, redirect } from "react-router";
import { type AuthServerSession, serverAuth } from "~/lib/auth/auth.server";

const authStorage = new AsyncLocalStorage<AuthServerSession>();
export const authContext = createContext<AuthServerSession>();

export function getCurrentSession(): AuthServerSession {
  return authStorage.getStore() ?? null;
}

export function getCurrentUser() {
  const session = getCurrentSession();
  return session?.user ?? null;
}

export function requireUser() {
  const session = getCurrentSession();
  if (!session) {
    throw new Error(
      "requireUser() called but no authenticated user found. " +
        "This indicates a programming error - make sure you're using " +
        "requireAuth middleware on this route!",
    );
  }
  return session;
}

async function processSession(
  request: Request,
  context: Readonly<RouterContextProvider>,
  requireLogin = false,
): Promise<AuthServerSession> {
  const session = await serverAuth.api.getSession({
    headers: request.headers,
  });

  if (requireLogin && !session?.user) {
    const url = new URL(request.url);
    const pathname = url.pathname || "/";
    throw redirect(
      `${href("/auth/sign-in")}?redirectTo=${encodeURIComponent(pathname)}`,
    );
  }

  context.set(authContext, session);
  return session;
}

export const requireAuth: MiddlewareFunction = async (
  { request, context },
  next,
) => {
  const session = await processSession(request, context, true);
  return authStorage.run(session, next);
};
