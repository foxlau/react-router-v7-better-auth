import type { MiddlewareFunction } from 'react-router'

import { auth } from '~/services/auth/auth.server'

import { optionalAuthContext } from './auth'

export const sessionMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const session = await auth.api.getSession({ headers: request.headers })
  context.set(optionalAuthContext, session)
}
