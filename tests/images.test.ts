import { env } from 'cloudflare:workers'
import { createStaticHandler } from 'react-router'
import { describe, expect, test } from 'vitest'

import { loader } from '../app/routes/images'

const handler = createStaticHandler([
  {
    path: 'images/*',
    loader: (args) => {
      const key = args.params['*']
      if (key === undefined) throw new Error('Missing image key')
      return loader({ ...args, params: { '*': key } })
    },
  },
])

describe('R2 image responses', () => {
  test.each([
    ['no metadata', undefined],
    ['empty metadata', {}],
    ['no content type', { contentType: undefined }],
  ] as const)(
    'uses application/octet-stream with %s',
    async (_, httpMetadata) => {
      await env.R2.put('user-avatar/test.png', 'binary data', { httpMetadata })
      const response = await handler.queryRoute(
        new Request('http://localhost/images/user-avatar/test.png'),
      )
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe(
        'application/octet-stream',
      )
      expect(new Uint8Array(await response.arrayBuffer())).toEqual(
        new TextEncoder().encode('binary data'),
      )
    },
  )

  test('preserves the stored content type', async () => {
    await env.R2.put('avatar.png', 'image bytes', {
      httpMetadata: { contentType: 'image/png' },
    })
    const response = await handler.queryRoute(
      new Request('http://localhost/images/avatar.png'),
    )
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new TextEncoder().encode('image bytes'),
    )
  })

  test('missing objects still return an empty 404', async () => {
    const response = await handler.queryRoute(
      new Request('http://localhost/images/missing.png'),
    )
    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
  })
})
