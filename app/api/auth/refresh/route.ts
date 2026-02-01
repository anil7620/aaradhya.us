import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken } from '@/lib/refresh-token'
import { generateTokenPair, verifyToken } from '@/lib/auth'
import { getUserByEmail } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger, getSafeErrorMessage } from '@/lib/logger'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { User } from '@/lib/models/User'

/**
 * Refresh access token using refresh token
 * 
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * 
 * Returns: { accessToken: string, refreshToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Verify refresh token and get user ID
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Get user to retrieve role and email for new access token
    const client = await clientPromise
    const db = client.db()
    const user = await db.collection<User>('users').findOne(
      { _id: userId },
      { projection: { email: 1, role: 1 } }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      userId: userId.toString(),
      email: user.email,
      role: user.role,
    })

    // Store new refresh token (old one is automatically invalidated by verifyRefreshToken)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    const clientIP = (forwarded?.split(',')[0].trim() || realIP || cfConnectingIP) ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const { storeRefreshToken } = await import('@/lib/refresh-token')
    await storeRefreshToken(
      userId,
      newRefreshToken,
      undefined,
      clientIP,
      userAgent
    )

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error: any) {
    logger.error('Error refreshing token:', error)
    const errorMessage = getSafeErrorMessage(
      'Failed to refresh token',
      error.message || 'Failed to refresh token'
    )
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
