import {
  createStaticHandler,
  type LoaderFunctionArgs,
  RouterContextProvider,
} from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  type AuthSession,
  guestOnlyMiddleware,
  optionalAuthContext,
  requireAuthMiddleware,
  requiredAuthContext,
  signInMiddleware,
} from '../app/middlewares/auth'

const session: AuthSession = {
  user: {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    username: null,
    displayUsername: null,
    image: null,
    role: 'user',
  },
  session: {
    userId: 'test-user',
    token: 'test-token',
    ipAddress: null,
    userAgent: null,
    expiresAt: new Date('2099-01-01'),
  },
}

const protectedHandler = vi.fn(({ context }: LoaderFunctionArgs) => {
  return Response.json({ userId: context.get(requiredAuthContext).user.id })
})
const guestHandler = vi.fn(() => Response.json({ guest: true }))

const handler = createStaticHandler([
  {
    path: '/',
    children: [
      {
        path: 'admin',
        middleware: [requireAuthMiddleware],
        children: [{ index: true, loader: protectedHandler }],
      },
      {
        path: 'settings',
        middleware: [requireAuthMiddleware],
        loader: () => null,
        children: [
          'account',
          'appearance',
          'sessions',
          'password',
          'connections',
        ].map((path) => ({
          id: path,
          path,
          loader: protectedHandler,
          action: protectedHandler,
        })),
      },
      {
        id: 'todos',
        path: 'todos',
        middleware: [requireAuthMiddleware],
        loader: protectedHandler,
        action: protectedHandler,
      },
      ...['sign-in', 'sign-up'].map((path) => ({
        path: `auth/${path}`,
        middleware: [
          path === 'sign-in' ? signInMiddleware : guestOnlyMiddleware,
        ],
        loader: guestHandler,
      })),
      { path: '*', loader: () => Response.json({ public: true }) },
    ],
  },
])

function context(authSession: AuthSession | null = null) {
  const context = new RouterContextProvider()
  context.set(optionalAuthContext, authSession)
  return context
}

async function query(
  path: string,
  authSession: AuthSession | null = null,
  method = 'GET',
  normalizedPath?: string,
) {
  const request = new Request(`http://localhost${path}`, { method })
  const response = await handler.query(request, {
    requestContext: context(authSession),
    normalizePath: normalizedPath
      ? () => {
          const url = new URL(normalizedPath, 'http://localhost')
          return { pathname: url.pathname, search: url.search, hash: url.hash }
        }
      : undefined,
    generateMiddlewareResponse: async (query) => {
      const result = await query(request)
      return result instanceof Response
        ? result
        : Response.json(result.loaderData, { status: result.statusCode })
    },
  })
  if (!(response instanceof Response))
    throw new Error('Expected a middleware response')
  return response
}

const protectedPaths = [
  '/admin',
  '/AdMiN',
  '/%61dmin',
  '/settings/account',
  '/SeTTings/appearance',
  '/%73ettings/password',
  '/settings/%73essions',
  '/settings/connections/',
  '/todos',
  '/ToDoS',
  '/%74odos',
]
const guestPaths = [
  '/auth/sign-in',
  '/AUTH/SIGN-IN',
  '/%61uth/sign-in',
  '/auth/sign-up',
  '/AUTH/SIGN-UP',
  '/auth/%73ign-up',
]

beforeEach(() => {
  protectedHandler.mockClear()
  guestHandler.mockClear()
})

describe('route-bound authentication', () => {
  for (const method of ['GET', 'HEAD', 'POST']) {
    test.each(protectedPaths)(
      `${method} %s redirects anonymous requests before handlers run`,
      async (path) => {
        const target = `${path}?tab=security&next=%2Ftodos`
        const response = await query(target, null, method)
        expect(response.status).toBe(302)
        const location = new URL(
          response.headers.get('Location') ?? '',
          'http://localhost',
        )
        expect(location.pathname).toBe('/auth/sign-in')
        expect(location.searchParams.get('redirectTo')).toBe(target)
        expect(protectedHandler).not.toHaveBeenCalled()
      },
    )
  }

  test.each([
    [
      '/%61dmin.data?_routes=routes%2Fadmin%2Fdashboard&tab=security',
      '/%61dmin?tab=security',
    ],
    [
      '/SeTTings/appearance.data?_routes=routes%2Fsettings%2Flayout&tab=security',
      '/SeTTings/appearance?tab=security',
    ],
    ['/todos/_.data?index&tab=security', '/todos/?tab=security'],
  ])(
    '%s redirects back to the normalized application URL',
    async (rawPath, normalizedPath) => {
      const response = await query(rawPath, null, 'GET', normalizedPath)
      expect(response.status).toBe(302)
      const location = new URL(
        response.headers.get('Location') ?? '',
        'http://localhost',
      )
      expect(location.searchParams.get('redirectTo')).toBe(normalizedPath)
      expect(protectedHandler).not.toHaveBeenCalled()
    },
  )

  test.each(protectedPaths)(
    '%s supplies the authenticated session to protected handlers',
    async (path) => {
      const response = await query(path, session)
      expect(response.status).toBe(200)
      expect(protectedHandler).toHaveBeenCalledTimes(1)
      const call = protectedHandler.mock.calls[0]
      expect(call?.[0].context.get(requiredAuthContext)).toBe(session)
    },
  )

  test.each(['/SeTTings/%61ccount', '/%74odos'])(
    'POST %s allows authenticated actions',
    async (path) => {
      const response = await query(path, session, 'POST')
      expect(response.status).toBe(200)
      expect(protectedHandler).toHaveBeenCalled()
    },
  )

  test.each(['GET', 'POST'])(
    '%s route-specific requests still run the parent layout guard',
    async (method) => {
      const request = new Request('http://localhost/%73ettings/account', {
        method,
      })
      const response = await handler.queryRoute(request, {
        routeId: 'account',
        requestContext: context(),
        generateMiddlewareResponse: (query) => query(request),
      })
      expect(response.status).toBe(302)
      expect(protectedHandler).not.toHaveBeenCalled()
    },
  )

  test('signed-in users can explicitly reauthenticate without a redirect loop', async () => {
    const response = await query(
      '/auth/sign-in?reauth=true&redirectTo=%2Fsettings%2Fsessions',
      session,
    )
    expect(response.status).toBe(200)
    expect(guestHandler).toHaveBeenCalledTimes(1)
  })

  test('reauthentication does not bypass the sign-up guest-only guard', async () => {
    expect((await query('/auth/sign-up?reauth=true', session)).status).toBe(302)
    expect(guestHandler).not.toHaveBeenCalled()
  })

  test.each(guestPaths)(
    '%s redirects authenticated users away from guest-only routes',
    async (path) => {
      const response = await query(path, session)
      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe('/')
      expect(guestHandler).not.toHaveBeenCalled()
    },
  )

  test.each(guestPaths)('%s remains accessible to guests', async (path) => {
    expect((await query(path)).status).toBe(200)
    expect(guestHandler).toHaveBeenCalledTimes(1)
  })

  test.each([
    '/',
    '/administrator',
    '/settings-public',
    '/todos-public',
    '/auth/sign-in-help',
  ])('%s does not inherit a literal-prefix guard', async (path) => {
    expect((await query(path)).status).toBe(200)
    expect((await query(path, session)).status).toBe(200)
    expect(protectedHandler).not.toHaveBeenCalled()
  })
})
