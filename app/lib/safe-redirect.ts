const DEFAULT_REDIRECT = '/'

/**
 * Validate a user-provided redirect path.
 * - Accept string or form-data values and trim whitespace.
 * - Reject absolute URLs, unsafe prefixes, and path traversal.
 * @param to The user-provided redirect path.
 * @param defaultRedirect The fallback for invalid paths.
 */
export function safeRedirectPath(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
): string {
  if (!to || typeof to !== 'string') return defaultRedirect

  const trimmedTo = to.trim()

  // Reject unsafe prefixes and path traversal.
  if (
    !trimmedTo.startsWith('/') || // Require a leading slash.
    trimmedTo.startsWith('//') || // Reject protocol-relative URLs.
    trimmedTo.startsWith('/\\') || // Reject backslash-prefixed URLs.
    trimmedTo.includes('..') // Reject relative path traversal.
  ) {
    return defaultRedirect
  }

  // Reject values that parse as absolute URLs.
  try {
    new URL(trimmedTo)
    // A successful parse identifies an absolute URL.
    return defaultRedirect
  } catch {
    // Relative paths need a base URL; validate them below.
  }

  // Resolve against a fixed origin and verify it cannot change.
  try {
    const url = new URL(trimmedTo, 'https://example.com')
    if (url.hostname !== 'example.com') return defaultRedirect
  } catch {
    return defaultRedirect
  }

  return trimmedTo
}
