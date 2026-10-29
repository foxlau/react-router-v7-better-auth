import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, test } from 'vitest'
import { z } from 'zod'

import { db } from '../app/db/index.server'
import * as schema from '../app/db/schema'
import { auth } from '../app/services/auth/auth.server'
import {
  checkPermission,
  requirePermission,
} from '../app/services/auth/permissions.server'
import normalizeAccountIDs from '../drizzle/migrations/0004_normalize_credential_account_ids.sql?raw'

const baseURL = 'http://localhost:5173'
let verificationURL = ''
let resetToken = ''
auth.options.emailVerification.sendVerificationEmail = async ({ url }) => {
  verificationURL = url
}
auth.options.emailAndPassword.sendResetPassword = async ({ token }) => {
  resetToken = token
}

const email = 'regression@example.com'
const password = 'Regression-test-password-42!'
const userResponse = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.string().nullish(),
  }),
})

function request(
  path: string,
  body?: Record<string, unknown>,
  cookie?: string,
) {
  const headers = new Headers({
    Origin: baseURL,
    'CF-Connecting-IP': '198.51.100.200',
  })
  if (body) headers.set('Content-Type', 'application/json')
  if (cookie) headers.set('Cookie', cookie)
  return auth.handler(
    new Request(new URL(`/api/auth${path}`, baseURL), {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),
  )
}

function cookies(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ')
}

async function executeFixture(name: string) {
  const fixture = env.TEST_SEEDS.find((migration) => migration.name === name)
  if (!fixture) throw new Error(`Missing SQL fixture: ${name}`)
  await env.DB.batch(fixture.queries.map((query) => env.DB.prepare(query)))
}

async function signUp() {
  const response = await request('/sign-up/email', {
    name: 'Regression User',
    email,
    password,
    callbackURL: '/',
  })
  expect(response.status).toBe(200)
  return userResponse.parse(await response.json()).user.id
}

async function verifiedUser() {
  const id = await signUp()
  expect(verificationURL).not.toBe('')
  const response = await auth.handler(new Request(verificationURL))
  expect(response.status).toBe(302)
  const cookie = cookies(response)
  expect(cookie).not.toBe('')
  return { id, cookie }
}

beforeEach(async () => {
  await executeFixture('reset.sql')
  verificationURL = ''
  resetToken = ''
})

describe('database-backed authentication', () => {
  test('sign-up, email verification, sign-in, session lookup and sign-out', async () => {
    await signUp()
    expect(await db.select().from(schema.sessions).all()).toHaveLength(0)
    expect((await request('/sign-in/email', { email, password })).status).toBe(
      403,
    )

    const verification = await auth.handler(new Request(verificationURL))
    expect(verification.status).toBe(302)
    expect((await db.select().from(schema.users).get())?.emailVerified).toBe(
      true,
    )
    expect(await db.select().from(schema.sessions).all()).toHaveLength(1)

    const signIn = await request('/sign-in/email', { email, password })
    expect(signIn.status).toBe(200)
    const cookie = cookies(signIn)
    const session = await request(
      '/get-session?disableCookieCache=true',
      undefined,
      cookie,
    )
    expect(session.status).toBe(200)
    expect(userResponse.parse(await session.json()).user.email).toBe(email)
    expect(await db.select().from(schema.sessions).all()).toHaveLength(2)

    const signOut = await request('/sign-out', {}, cookie)
    expect(signOut.status).toBe(200)
    const signedOut = await request(
      '/get-session?disableCookieCache=true',
      undefined,
      cookie,
    )
    expect(await signedOut.json()).toBeNull()
    expect(await db.select().from(schema.sessions).all()).toHaveLength(1)
  })

  test('password reset tokens are consumed only once under concurrent requests', async () => {
    await verifiedUser()
    const reset = await request('/request-password-reset', {
      email,
      redirectTo: '/auth/reset-password',
    })
    expect(reset.status).toBe(200)
    expect(resetToken).not.toBe('')
    expect(await db.select().from(schema.verifications).all()).toHaveLength(1)

    const newPassword = 'Changed-regression-password-42!'
    const results = await Promise.all([
      request('/reset-password', { token: resetToken, newPassword }),
      request('/reset-password', { token: resetToken, newPassword }),
    ])
    expect(results.map((response) => response.status).sort()).toEqual([
      200, 400,
    ])
    expect(await db.select().from(schema.verifications).all()).toHaveLength(0)
    expect((await request('/sign-in/email', { email, password })).status).toBe(
      401,
    )
    expect(
      (await request('/sign-in/email', { email, password: newPassword }))
        .status,
    ).toBe(200)
  })

  test('unlink uses the local account ID and protects the last login method', async () => {
    const { id, cookie } = await verifiedUser()
    await db
      .insert(schema.accounts)
      .values({
        id: 'local-github-row',
        accountId: 'external-provider-account-id',
        providerId: 'github',
        userId: id,
      })
      .run()

    const invalid = await request(
      '/unlink-account',
      { accountId: 'external-provider-account-id' },
      cookie,
    )
    expect(invalid.status).toBe(400)
    const unlink = await request(
      '/unlink-account',
      { accountId: 'local-github-row' },
      cookie,
    )
    expect(unlink.status).toBe(200)
    const accounts = await db.select().from(schema.accounts).all()
    expect(accounts).toHaveLength(1)
    expect(accounts[0]?.providerId).toBe('credential')
    const lastAccount = await request(
      '/unlink-account',
      { accountId: accounts[0]?.id },
      cookie,
    )
    expect(lastAccount.status).toBe(400)
  })

  test('database rate limiting cannot be bypassed by concurrent requests', async () => {
    const responses = await Promise.all(
      Array.from({ length: 8 }, () =>
        request('/sign-up/email', {
          name: 'Invalid signup',
          email: 'invalid',
          password,
        }),
      ),
    )
    expect(
      responses.filter((response) => response.status === 400),
    ).toHaveLength(3)
    expect(
      responses.filter((response) => response.status === 429),
    ).toHaveLength(5)
    expect((await db.select().from(schema.rateLimits).get())?.count).toBe(3)
  })

  test('the documented seed login and admin permissions work', async () => {
    await executeFixture('seed.sql')
    await executeFixture('seed.sql')
    expect(await db.select().from(schema.users).all()).toHaveLength(1)
    const response = await request('/sign-in/email', {
      email: 'admin@example.com',
      password: 'admin@8899',
    })
    expect(response.status).toBe(200)
    const session = await request(
      '/get-session?disableCookieCache=true',
      undefined,
      cookies(response),
    )
    expect(userResponse.parse(await session.json()).user.role).toBe('admin')
    const adminId = (await db.select().from(schema.users).get())?.id
    expect(adminId).toBeDefined()
    if (!adminId) throw new Error('Seed admin was not created')
    expect(await requirePermission(adminId, { dashboard: ['read'] })).toBe(true)

    const { id } = await verifiedUser()
    expect(await checkPermission(id, { dashboard: ['read'] })).toBe(false)
    await expect(
      requirePermission(id, { dashboard: ['read'] }),
    ).rejects.toMatchObject({ status: 403 })
  })

  test('upgrading normalizes legacy password account IDs without changing OAuth IDs', async () => {
    await executeFixture('seed.sql')
    await env.DB.prepare(
      "UPDATE accounts SET account_id = 'account_' || user_id WHERE provider_id = 'credential'",
    ).run()
    const user = await db.select().from(schema.users).get()
    if (!user) throw new Error('Seed admin was not created')
    await db
      .insert(schema.accounts)
      .values({
        id: 'legacy-oauth-row',
        accountId: 'external-provider-id',
        providerId: 'github',
        userId: user.id,
      })
      .run()
    await env.DB.prepare(normalizeAccountIDs).run()
    const accounts = await db.select().from(schema.accounts).all()
    expect(
      accounts.find((account) => account.providerId === 'credential')
        ?.accountId,
    ).toBe(user.id)
    expect(
      accounts.find((account) => account.providerId === 'github')?.accountId,
    ).toBe('external-provider-id')
    expect(
      (
        await request('/sign-in/email', {
          email: user.email,
          password: 'admin@8899',
        })
      ).status,
    ).toBe(200)
  })

  test('local reset clears application/auth data and preserves the schema', async () => {
    const { id } = await verifiedUser()
    await db
      .insert(schema.todos)
      .values({ title: 'Reset regression', userId: id })
      .run()
    expect((await request('/request-password-reset', { email })).status).toBe(
      200,
    )
    await executeFixture('reset.sql')
    for (const table of [
      schema.users,
      schema.sessions,
      schema.accounts,
      schema.verifications,
      schema.rateLimits,
      schema.todos,
    ]) {
      expect(await db.select().from(table).all()).toHaveLength(0)
    }
    await signUp()
  })

  test('rate-limit windows reset in database storage', async () => {
    await db
      .insert(schema.rateLimits)
      .values({
        id: 'expired-limit',
        key: '198.51.100.200|/sign-up/email',
        count: 3,
        lastRequest: Date.now() - 11_000,
      })
      .run()
    const response = await request('/sign-up/email', {
      name: 'Invalid signup',
      email: 'invalid',
      password,
    })
    expect(response.status).toBe(400)
    expect((await db.select().from(schema.rateLimits).get())?.count).toBe(1)
  })
})
