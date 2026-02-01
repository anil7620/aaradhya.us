import { NextRequest, NextResponse } from 'next/server'
import { verifyCSRFToken, getCSRFTokenFromRequest } from './csrf'

/**
 * Verify CSRF token for state-changing operations
 * Returns null if valid, or an error response if invalid
 */
export function verifyCSRFForRequest(request: NextRequest): NextResponse | null {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const method = request.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null
  }

  // Skip CSRF check for webhook endpoints (they use their own signature verification)
  const pathname = request.nextUrl.pathname
  if (pathname.includes('/webhook')) {
    return null
  }

  // Get CSRF token from header
  const csrfToken = getCSRFTokenFromRequest(request)
  
  // Get CSRF token from cookie
  const csrfCookie = request.cookies.get('csrf-token')?.value

  // Verify CSRF token
  if (!verifyCSRFToken(csrfToken, csrfCookie || null)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token. Please refresh the page and try again.' },
      { status: 403 }
    )
  }

  return null // CSRF token is valid
}
