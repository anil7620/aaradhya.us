import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Rate limiting: 5 requests per hour per IP
    // Get IP from NextRequest headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    const clientIP = forwarded?.split(',')[0].trim() || realIP || cfConnectingIP || 'unknown'
    const rateLimitKey = `email-check:${clientIP}`
    const rateLimitResult = rateLimit(rateLimitKey, 5, 60 * 60 * 1000) // 5 requests per hour

    if (!rateLimitResult.success) {
      // Return generic response to prevent enumeration when rate limited
      // This prevents attackers from enumerating emails even when rate limited
      return NextResponse.json(
        { 
          exists: true, // Generic response - doesn't reveal actual status
          error: 'Too many requests. Please try again later.',
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      )
    }

    // Check if email exists
    const existingUser = await getUserByEmail(email)
    
    // Return actual result (with rate limiting in place, enumeration is limited)
    return NextResponse.json(
      { exists: !!existingUser },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    )
  } catch (error) {
    logger.error('Check email error:', error)
    // Return generic response on error to prevent information leakage
    return NextResponse.json(
      { exists: true }, // Generic response - doesn't reveal error details
      { status: 500 }
    )
  }
}

