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
import * as usersRoute from '../app/routes/admin/users'
import { auth } from '../app/services/auth/auth.server'

const baseURL = 'http://localhost:5173'
const email = 'admin@example.com'
const adminLoader = vi.fn(adminLayout.loader)
const usersLoader = vi.fn(usersRoute.loader)
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
          {
            id: 'users',
            path: 'users',
            middleware: usersRoute.middleware,
            loader: usersLoader,
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
  usersLoader.mockClear()
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
  leafRoute?: 'dashboard' | 'users',
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
    filterMatchesToLoad: leafRoute
      ? (match) => match.route.id === leafRoute
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
        'dashboard',
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

describe('admin-only users route', () => {
  test.each(['/admin/users', '/AdMiN/UsErS', '/%61dmin/%75sers'])(
    '%s redirects guests before reading user data',
    async (path) => {
      const response = await query(path)
      expect(response.status).toBe(302)
      const location = new URL(response.headers.get('Location') ?? '', baseURL)
      expect(location.pathname).toBe('/auth/sign-in')
      expect(location.searchParams.get('redirectTo')).toBe(path)
      expect(usersLoader).not.toHaveBeenCalled()
    },
  )

  test.each([
    ['admin', 200],
    ['admin,editor', 200],
    ['editor', 403],
    ['user', 403],
  ] as const)('%s receives %s on the users page', async (role, status) => {
    const response = await query('/admin/users', await signIn(role))
    expect(response.status).toBe(status)
    expect(usersLoader).toHaveBeenCalledTimes(status === 200 ? 1 : 0)
    expect(adminLoader).toHaveBeenCalledTimes(status === 200 ? 1 : 0)
  })

  test.each([
    ['admin', 200],
    ['editor', 403],
    ['user', 403],
  ] as const)(
    'targeted users .data requests enforce %s permissions',
    async (role, status) => {
      const response = await query(
        '/%61dmin/%75sers.data?_routes=users',
        await signIn(role),
        'GET',
        'users',
      )
      expect(response.status).toBe(status)
      expect(adminLoader).not.toHaveBeenCalled()
      expect(usersLoader).toHaveBeenCalledTimes(status === 200 ? 1 : 0)
    },
  )

  test('lists user profiles without private moderation or authentication data', async () => {
    const createdAt = new Date('2030-01-02T03:04:05.000Z')
    await db.insert(users).values({
      id: 'listed-user',
      name: 'Listed User',
      email: 'listed@example.com',
      role: null,
      banned: true,
      banReason: 'Private moderation note',
      createdAt,
    })
    const response = await query('/admin/users', await signIn('admin'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      loaderData: {
        users: {
          users: [
            {
              id: 'listed-user',
              name: 'Listed User',
              image: null,
              username: null,
              email: 'listed@example.com',
              role: null,
              emailVerified: false,
              banned: true,
              createdAt: createdAt.toISOString(),
            },
            { email, role: 'admin' },
          ],
        },
      },
    })
    expect(JSON.stringify(body)).not.toContain('Private moderation note')
  })

  test('removing the admin role blocks existing cookies but keeps editor dashboard access', async () => {
    const cookie = await signIn('admin')
    await setRole('editor')
    expect((await query('/admin/users', cookie)).status).toBe(403)
    expect(usersLoader).not.toHaveBeenCalled()
    expect((await query('/admin', cookie)).status).toBe(200)
  })

  test('granting the admin role permits access with existing cookies', async () => {
    const cookie = await signIn('editor')
    await setRole('admin')
    expect((await query('/admin/users', cookie)).status).toBe(200)
    expect(usersLoader).toHaveBeenCalledTimes(1)
  })
})
