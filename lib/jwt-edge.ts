/**
 * Edge Runtime compatible JWT decoder
 * This decodes JWT without verification (for routing purposes only)
 * Actual token verification happens in API routes using the full verifyToken function
 */

import { UserRoleType } from './models/User'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRoleType
}

/**
 * Decode JWT token without verification (Edge Runtime compatible)
 * This is safe for routing decisions - actual verification happens in API routes
 */
export function decodeTokenEdge(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    
    // Base64 URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const decoded = JSON.parse(jsonPayload) as JWTPayload & { exp?: number }
    
    // Check expiration if present
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch {
    return null
  }
}

