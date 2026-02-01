/**
 * Client-side CSRF token utilities
 * These functions help frontend code include CSRF tokens in API requests
 */

/**
 * Get CSRF token from cookies (client-side)
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'csrf-token') {
      return decodeURIComponent(value)
    }
  }

  return null
}

/**
 * Get headers with CSRF token for fetch requests
 */
export function getCSRFHeaders(): HeadersInit {
  const token = getCSRFToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['X-CSRF-Token'] = token
  }

  return headers
}

/**
 * Enhanced fetch with automatic CSRF token inclusion
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getCSRFToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('X-CSRF-Token', token)
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
