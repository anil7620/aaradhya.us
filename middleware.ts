import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeTokenEdge, JWTPayload } from './lib/jwt-edge'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Public routes (accessible without login)
  const publicRoutes = ['/login', '/register', '/', '/products', '/cart', '/checkout']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/products') ||
    request.nextUrl.pathname.startsWith('/checkout') ||
    request.nextUrl.pathname.startsWith('/api/checkout') ||
    request.nextUrl.pathname.startsWith('/api/products') ||
    request.nextUrl.pathname.startsWith('/api/categories')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Decode token for routing (Edge Runtime compatible)
  // Note: This doesn't verify the signature, but is sufficient for routing decisions
  // Actual verification happens in API routes and page components
  const payload = decodeTokenEdge(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  const { pathname } = request.nextUrl
  
  // Admin only routes
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }


  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

