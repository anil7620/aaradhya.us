import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { generateCSRFToken } from '@/lib/csrf'
import { getOrCreateSession } from '@/lib/session'

interface JWTPayload {
  userId: string
  email: string
  role: string
  type?: 'access' | 'refresh'
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const response = NextResponse.next()

  // Generate or retrieve guest session ID (for cart and wishlist)
  // This ensures every visitor has a unique session, even if not logged in
  getOrCreateSession(request, response)

  // Set CSRF token cookie if not present (for all requests)
  // This implements the double-submit cookie pattern for CSRF protection
  const existingCSRFToken = request.cookies.get('csrf-token')?.value
  if (!existingCSRFToken) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Must be accessible to JavaScript for double-submit pattern
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })
  }

  // Public routes (accessible without login)
  const publicRoutes = ['/login', '/register', '/', '/products', '/cart', '/checkout']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/api/auth') || // Includes /api/auth/refresh and /api/auth/logout
    request.nextUrl.pathname.startsWith('/products') ||
    request.nextUrl.pathname.startsWith('/checkout') ||
    request.nextUrl.pathname.startsWith('/api/checkout') ||
    request.nextUrl.pathname.startsWith('/api/products') ||
    request.nextUrl.pathname.startsWith('/api/categories') ||
    request.nextUrl.pathname.startsWith('/api/cart/guest') || // Guest cart endpoints
    request.nextUrl.pathname.startsWith('/api/wishlist') // Wishlist endpoints (work for both authenticated and guest)
  )

  if (isPublicRoute) {
    return response
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify JWT signature using jose (Edge Runtime compatible)
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    // Don't use console.error in Edge Runtime - it can cause issues
    // Logging is handled by the redirect
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    // Extract verified payload with proper typing
    const verifiedPayload = payload as unknown as JWTPayload & { exp?: number; iat?: number }
    
    // Validate required fields
    if (!verifiedPayload.userId || !verifiedPayload.email || !verifiedPayload.role) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Only accept access tokens for route protection (reject refresh tokens)
    if (verifiedPayload.type === 'refresh') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check expiration if present
    if (verifiedPayload.exp && verifiedPayload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access control
    const { pathname } = request.nextUrl
    
    // Admin only routes
    if (pathname.startsWith('/admin') && verifiedPayload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    // Token verification failed (invalid signature, malformed token, etc.)
    // Don't use console.error in Edge Runtime - it can cause middleware failures
    // Silently redirect to login for security (don't leak error details)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

