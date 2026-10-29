import type { MiddlewareFunction } from 'react-router'
import { createContext, href, redirect } from 'react-router'

import { safeRedirectPath } from '~/lib/safe-redirect'
import type { auth } from '~/services/auth/auth.server'
import { requirePermission } from '~/services/auth/permissions.server'

export type AuthSession = typeof auth.$Infer.Session
export const optionalAuthContext = createContext<AuthSession | null>(null)
export const requiredAuthContext = createContext<AuthSession>()

// Attach guards to routes/layouts so React Router decides which URLs they protect.
export const requireAuthMiddleware: MiddlewareFunction = ({ url, context }) => {
  const session = context.get(optionalAuthContext)
  if (!session) {
    const safe = safeRedirectPath(url.pathname + url.search, '/')
    throw redirect(
      `${href('/auth/sign-in')}?redirectTo=${encodeURIComponent(safe)}`,
    )
  }

  context.set(requiredAuthContext, session)
}

export const requireAdmin: MiddlewareFunction = async (args, next) => {
  await requireAuthMiddleware(args, next)
  const { user } = args.context.get(requiredAuthContext)
  await requirePermission(user.id, { dashboard: ['read'] })
}

export const guestOnlyMiddleware: MiddlewareFunction = ({ context }) => {
  if (context.get(optionalAuthContext)) {
    throw redirect(href('/'))
  }
}

export const signInMiddleware: MiddlewareFunction = (args, next) => {
  if (args.url.searchParams.get('reauth') === 'true') return
  return guestOnlyMiddleware(args, next)
}
