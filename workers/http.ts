/**
 * Redirect safe navigation requests to their canonical URL without
 * trailing slashes.
 *
 * Examples:
 * - `/about/` → `/about`
 * - `/about///?tab=profile` → `/about?tab=profile`
 *
 * The root path `/` and non-GET/HEAD requests are not redirected.
 *
 * @param request
 * @returns
 */
export function trimTrailingSlash(request: Request): Response | undefined {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return
  }

  const url = new URL(request.url)
  if (url.pathname === '/' || !url.pathname.endsWith('/')) {
    return
  }

  url.pathname = url.pathname.replace(/\/+$/, '')

  return Response.redirect(url.toString(), 308)
}

const statusColors: Record<number, string> = {
  2: '\x1b[32m',
  3: '\x1b[36m',
  4: '\x1b[33m',
  5: '\x1b[31m',
}

/**
 * Development access logs never include queries, headers, or bodies.
 * @param request
 * @param handle
 * @param color
 * @returns
 */
export async function logRequest(
  request: Request,
  handle: () => Response | Promise<Response>,
  color = true,
) {
  const label = `${request.method} ${new URL(request.url).pathname}`
  const started = performance.now()
  let status = 500

  console.log(`<-- ${label}`)

  try {
    const response = await handle()
    status = response.status
    return response
  } catch (error) {
    if (error instanceof Response) status = error.status
    throw error
  } finally {
    const elapsed = performance.now() - started
    const duration =
      elapsed < 1000
        ? `${Math.round(elapsed)}ms`
        : `${(elapsed / 1000).toFixed(2)}s`
    const ansi = color ? statusColors[Math.floor(status / 100)] : undefined
    const formattedStatus = ansi ? `${ansi}${status}\x1b[0m` : String(status)
    console.log(`--> ${label} ${formattedStatus} ${duration}`)
  }
}
