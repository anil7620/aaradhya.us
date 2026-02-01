'use client'

/**
 * ⚠️ SECURITY WARNING: Client-Side JWT Decoding
 * 
 * This module contains functions that decode JWT tokens WITHOUT signature verification.
 * These functions are ONLY safe for UI display purposes and MUST NEVER be used for
 * security or authorization decisions.
 * 
 * IMPORTANT SECURITY RULES:
 * 1. ❌ NEVER use these functions to make authorization decisions
 * 2. ❌ NEVER use these functions to determine if a user can access protected resources
 * 3. ❌ NEVER use these functions to bypass server-side authentication
 * 4. ✅ ONLY use these functions to display user information in the UI
 * 5. ✅ ALL security decisions MUST happen server-side in API routes and middleware
 * 
 * Server-side verification:
 * - Middleware verifies tokens using jwtVerify from 'jose' library
 * - API routes verify tokens using verifyToken from '@/lib/auth'
 * - All protected operations require server-side token verification
 * 
 * This is safe only because:
 * - We never make security decisions based on client-side decoding
 * - All protected operations verify tokens server-side
 * - This is only used to display user info in the UI (name, email, role for display)
 * - Route protection is handled by middleware with proper signature verification
 */

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'customer'
}

/**
 * ⚠️ WARNING: This function ONLY decodes the JWT payload for UI display purposes.
 * It does NOT verify the signature and MUST NOT be used for any security decisions.
 * All authorization checks MUST happen server-side in API routes and middleware.
 * 
 * This is safe only because:
 * 1. We never make security decisions based on this
 * 2. All protected operations verify tokens server-side
 * 3. This is only used to display user info in the UI
 * 
 * @param token - JWT token string (from cookie)
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Get JWT token from browser cookies
 * @returns Token string or null if not found
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1] || null
  )
}

/**
 * ⚠️ WARNING: This function ONLY decodes the JWT for UI display purposes.
 * It does NOT verify the signature and MUST NOT be used for security decisions.
 * 
 * Use this ONLY for:
 * - Displaying user name/email in the UI
 * - Showing/hiding UI elements based on login status
 * - Conditional rendering for better UX
 * 
 * NEVER use this for:
 * - Determining if a user can access a route (middleware handles this)
 * - Making authorization decisions (API routes handle this)
 * - Bypassing server-side security checks
 * 
 * @returns Decoded user payload or null if not logged in
 */
export function getCurrentUser(): JWTPayload | null {
  const token = getTokenFromCookie()
  if (!token) return null
  return decodeToken(token)
}

