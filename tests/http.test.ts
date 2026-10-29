import { afterEach, describe, expect, test, vi } from 'vitest'

import { logRequest, trimTrailingSlash } from '../workers/http'

afterEach(() => vi.restoreAllMocks())

describe('Worker HTTP boundary', () => {
  test.each(['GET', 'HEAD'])(
    '%s redirects trailing slashes and preserves the query',
    (method) => {
      const response = trimTrailingSlash(
        new Request('http://localhost/todos///?tab=security', { method }),
      )
      expect(response?.status).toBe(308)
      expect(response?.headers.get('Location')).toBe(
        'http://localhost/todos?tab=security',
      )
    },
  )

  test.each(['/', '/todos'])('%s is already canonical', (path) => {
    expect(
      trimTrailingSlash(new Request(`http://localhost${path}`)),
    ).toBeUndefined()
  })

  test('does not redirect form submissions', () => {
    expect(
      trimTrailingSlash(
        new Request('http://localhost/todos/', { method: 'POST' }),
      ),
    ).toBeUndefined()
  })
})

describe('development access logs', () => {
  test('returns the untouched response without logging secrets or bodies', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const response = new Response('private response body', { status: 201 })
    const request = new Request(
      'http://localhost/api/auth/reset-password?token=private-token',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer private-header' },
        body: 'private request body',
      },
    )
    const result = await logRequest(request, () => response, false)
    expect(result).toBe(response)
    expect(await result.text()).toBe('private response body')
    expect(request.bodyUsed).toBe(false)
    expect(log).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenNthCalledWith(1, '<-- POST /api/auth/reset-password')
    expect(log).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(
        /^--> POST \/api\/auth\/reset-password 201 \d+(?:\.\d+)?(?:ms|s)$/,
      ),
    )
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-')
  })

  test('can color the response status', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await logRequest(
      new Request('http://localhost/'),
      () => new Response(null, { status: 503 }),
    )
    expect(log).toHaveBeenLastCalledWith(
      expect.stringContaining('\x1b[31m503\x1b[0m'),
    )
  })

  test('also logs redirects generated before React Router runs', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const request = new Request('http://localhost/todos/')
    const response = await logRequest(
      request,
      () => {
        const redirect = trimTrailingSlash(request)
        if (!redirect) throw new Error('Expected a canonical redirect')
        return redirect
      },
      false,
    )
    expect(response.status).toBe(308)
    expect(log).toHaveBeenLastCalledWith(
      expect.stringMatching(/^--> GET \/todos\/ 308 /),
    )
  })

  test('rethrows errors and records status 500 without dumping the error', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = new Error('private-token')
    await expect(
      logRequest(
        new Request('http://localhost/failure'),
        () => {
          throw error
        },
        false,
      ),
    ).rejects.toBe(error)
    expect(log).toHaveBeenLastCalledWith(
      expect.stringMatching(/^--> GET \/failure 500 /),
    )
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-token')
  })

  test('preserves the status and identity of thrown responses', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const redirect = new Response(null, {
      status: 302,
      headers: { Location: '/' },
    })
    await expect(
      logRequest(
        new Request('http://localhost/redirect'),
        () => {
          throw redirect
        },
        false,
      ),
    ).rejects.toBe(redirect)
    expect(log).toHaveBeenLastCalledWith(
      expect.stringMatching(/^--> GET \/redirect 302 /),
    )
  })
})
