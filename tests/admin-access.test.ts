import { env } from 'cloudflare:workers'
import { eq } from 'drizzle-orm'
import {
  createStaticHandler,
  type LoaderFunctionArgs,
  RouterContextProvider,
} from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { db } from '../app/db/index.server'
import { sessions, users } from '../app/db/schema'
import {
  guestOnlyMiddleware,
  requiredAuthContext,
} from '../app/middlewares/auth'
import { sessionMiddleware } from '../app/middlewares/session'
import * as adminLayout from '../app/routes/admin/layout'
import { auth } from '../app/services/auth/auth.server'

const baseURL = 'http://localhost:5173'
const email = 'admin@example.com'
const adminLoader = vi.fn(adminLayout.loader)
const childLoader = vi.fn(({ context }: LoaderFunctionArgs) => {
  const { user } = context.get(requiredAuthContext)
  return { role: user.role }
})
const childAction = vi.fn(() => ({ changed: true }))
const handler = createStaticHandler([
  {
    id: 'root',
    path: '/',
    middleware: [sessionMiddleware],
    loader: () => null,
    children: [
      {
        id: 'admin',
        path: 'admin',
        middleware: adminLayout.middleware,
        loader: adminLoader,
        children: [
          {
            id: 'dashboard',
            index: true,
            loader: childLoader,
            action: childAction,
          },
        ],
      },
      {
        path: 'auth/sign-in',
        middleware: [guestOnlyMiddleware],
        loader: () => null,
      },
    ],
  },
])

beforeEach(async () => {
  for (const name of ['reset.sql', 'seed.sql']) {
    const fixture = env.TEST_SEEDS.find((migration) => migration.name === name)
    if (!fixture) throw new Error(`Missing SQL fixture: ${name}`)
    await env.DB.batch(fixture.queries.map((query) => env.DB.prepare(query)))
  }
  adminLoader.mockClear()
  childLoader.mockClear()
  childAction.mockClear()
})

async function setRole(role: string) {
  await db.update(users).set({ role }).where(eq(users.email, email))
}

async function signIn(role: string) {
  await setRole(role)
  const response = await auth.handler(
    new Request(`${baseURL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { Origin: baseURL, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'admin@8899' }),
    }),
  )
  expect(response.status).toBe(200)
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ')
  expect(cookie).toContain('session_token=')
  return cookie
}

async function query(
  path: string,
  cookie = '',
  method = 'GET',
  leafOnly = false,
) {
  const request = new Request(new URL(path, baseURL), {
    method,
    headers: { Cookie: cookie },
  })
  const url = new URL(request.url)
  url.pathname = url.pathname.replace(/\.data$/, '')
  url.searchParams.delete('_routes')
  const response = await handler.query(request, {
    requestContext: new RouterContextProvider(),
    normalizePath: () => ({
      pathname: url.pathname,
      search: url.search,
      hash: '',
    }),
    filterMatchesToLoad: leafOnly
      ? (match) => match.route.id === 'dashboard'
      : undefined,
    generateMiddlewareResponse: async (run) => {
      const result = await run(request)
      return result instanceof Response
        ? result
        : Response.json(
            { loaderData: result.loaderData, actionData: result.actionData },
            { status: result.statusCode },
          )
    },
  })
  if (!(response instanceof Response))
    throw new Error('Expected a middleware response')
  return response
}

describe('admin authorization before route handlers', () => {
  test.each(['/admin', '/AdMiN', '/%61dmin'])(
    '%s redirects guests before any child handler runs',
    async (path) => {
      const response = await query(`${path}?tab=security`)
      expect(response.status).toBe(302)
      const location = new URL(response.headers.get('Location') ?? '', baseURL)
      expect(location.pathname).toBe('/auth/sign-in')
      expect(location.searchParams.get('redirectTo')).toBe(
        `${path}?tab=security`,
      )
      expect(childLoader).not.toHaveBeenCalled()
      expect(childAction).not.toHaveBeenCalled()
    },
  )

  test.each(['admin', 'editor'])('%s can enter the dashboard', async (role) => {
    const response = await query('/admin', await signIn(role))
    expect(response.status).toBe(200)
    expect(childLoader).toHaveBeenCalledTimes(1)
  })

  test('ordinary users receive 403 before any loader runs', async () => {
    expect((await query('/admin', await signIn('user'))).status).toBe(403)
    expect(adminLoader).not.toHaveBeenCalled()
    expect(childLoader).not.toHaveBeenCalled()
  })

  test('ordinary users cannot reach a child action', async () => {
    expect(
      (await query('/admin?index', await signIn('user'), 'POST')).status,
    ).toBe(403)
    expect(childAction).not.toHaveBeenCalled()
  })

  test.each(['user', 'admin', 'editor'])(
    'targeted .data requests enforce %s permissions even when the parent loader is skipped',
    async (role) => {
      const response = await query(
        '/%61dmin.data?_routes=dashboard',
        await signIn(role),
        'GET',
        true,
      )
      expect(response.status).toBe(role === 'user' ? 403 : 200)
      expect(adminLoader).not.toHaveBeenCalled()
      expect(childLoader).toHaveBeenCalledTimes(role === 'user' ? 0 : 1)
    },
  )

  test('role revocation takes effect with the existing sign-in cookies', async () => {
    const cookie = await signIn('admin')
    await setRole('user')
    expect((await query('/admin', cookie)).status).toBe(403)
    expect(childLoader).not.toHaveBeenCalled()
  })

  test('new role grants also update the session seen by child loaders', async () => {
    const cookie = await signIn('user')
    await setRole('editor')
    const response = await query('/admin', cookie)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      loaderData: { dashboard: { role: 'editor' } },
    })
  })

  test('revoked sessions are rejected without causing a guest-only sign-in redirect loop', async () => {
    const cookie = await signIn('admin')
    await db.delete(sessions)
    const response = await query('/admin', cookie)
    expect(response.status).toBe(302)
    expect(childLoader).not.toHaveBeenCalled()
    const location = response.headers.get('Location')
    if (!location) throw new Error('Expected a sign-in redirect')
    expect((await query(location, cookie)).status).toBe(200)
  })
})
