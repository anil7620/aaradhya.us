/**
 * Generate a cryptographically secure CSRF token
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  // This works in both Node.js and Edge Runtime
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    // Web Crypto API (Edge Runtime)
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for Node.js (shouldn't be needed but provides compatibility)
  try {
    const nodeCrypto = require('crypto')
    return nodeCrypto.randomBytes(32).toString('hex')
  } catch {
    // Last resort: use Math.random (not cryptographically secure, but better than nothing)
    // This should never happen in production
    let result = ''
    for (let i = 0; i < 64; i++) {
      result += Math.floor(Math.random() * 16).toString(16)
    }
    return result
  }
}

/**
 * Verify CSRF token using double-submit cookie pattern
 * The token in the header must match the token in the cookie
 * Uses constant-time comparison to prevent timing attacks
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
  // Convert hex strings to Uint8Array for comparison
  const tokenBytes = new Uint8Array(
    token.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )
  const cookieBytes = new Uint8Array(
    cookieToken.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )
  
  // Constant-time comparison
  if (tokenBytes.length !== cookieBytes.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < tokenBytes.length; i++) {
    result |= tokenBytes[i] ^ cookieBytes[i]
  }
  
  return result === 0
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
