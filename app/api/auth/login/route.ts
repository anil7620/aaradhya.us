import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, generateTokenPair } from '@/lib/auth'
import { storeRefreshToken } from '@/lib/refresh-token'
import { logger } from '@/lib/logger'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    })

    // Store refresh token in database
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    const clientIP = (forwarded?.split(',')[0].trim() || realIP || cfConnectingIP) ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    await storeRefreshToken(
      user._id!,
      refreshToken,
      undefined, // deviceInfo (can be extracted from user-agent if needed)
      clientIP,
      userAgent
    )

    let redirect = '/dashboard'
    if (user.role === 'admin') {
      redirect = '/admin'
    }

    return NextResponse.json({ 
      token: accessToken, // Keep 'token' for backward compatibility
      accessToken, // New field name
      refreshToken,
      redirect 
    })
  } catch (error) {
    logger.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

