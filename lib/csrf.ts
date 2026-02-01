import crypto from 'crypto'

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify CSRF token using double-submit cookie pattern
 * The token in the header must match the token in the cookie
 */
export function verifyCSRFToken(token: string | null, cookieToken: string | null): boolean {
  if (!token || !cookieToken) {
    return false
  }
  
  // Tokens must be 64 characters (32 bytes hex encoded)
  if (token.length !== 64 || cookieToken.length !== 64) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(cookieToken, 'hex')
  )
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get('X-CSRF-Token')
}

/**
 * Get CSRF token from cookies
 */
export function getCSRFTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null
  }
  
  const cookies = cookieHeader.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'csrf-token') {
      return decodeURIComponent(value)
    }
  }
  
  return null
}
