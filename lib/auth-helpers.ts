import { NextRequest } from 'next/server'

/**
 * Centralized token extraction from Next.js requests
 * 
 * This function provides a consistent way to extract JWT tokens from requests,
 * supporting both Authorization header (for API clients) and cookies (for browser requests).
 * 
 * Priority:
 * 1. Authorization header with Bearer token (for API clients, mobile apps, etc.)
 * 2. Cookie token (for browser-based requests)
 * 
 * @param request - Next.js request object
 * @returns JWT token string or null if not found
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first (for API clients, mobile apps, etc.)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim()
  }
  
  // Fallback to cookie (for browser requests)
  return request.cookies.get('token')?.value || null
}
