/**
 * Session Management Utility
 * Handles guest session creation, validation, and management
 * Follows industry best practices for e-commerce session management
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Session cookie configuration
 * - HttpOnly: Prevents XSS attacks
 * - Secure: HTTPS only in production
 * - SameSite: CSRF protection
 * - MaxAge: 30 days (standard for e-commerce)
 */
const SESSION_COOKIE_NAME = 'guest-session-id'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Generate a unique session ID (UUID v4)
 * This ensures each guest gets a unique identifier
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export function generateSessionId(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for environments without crypto.randomUUID
  // Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get session ID from request cookies
 */
export function getSessionIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null
}

/**
 * Set session ID in response cookie
 */
export function setSessionCookie(
  response: NextResponse,
  sessionId: string
): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection, allows navigation from external sites
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Get or create session ID for a request
 * If no session exists, creates a new one and sets it in the response
 */
export function getOrCreateSession(
  request: NextRequest,
  response: NextResponse
): string {
  let sessionId = getSessionIdFromRequest(request)

  if (!sessionId) {
    // Generate new session ID
    sessionId = generateSessionId()
    setSessionCookie(response, sessionId)
  }

  return sessionId
}

/**
 * Validate session ID format (UUID v4)
 */
export function isValidSessionId(sessionId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(sessionId)
}

/**
 * Clear session cookie (for logout or session expiration)
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME)
}
