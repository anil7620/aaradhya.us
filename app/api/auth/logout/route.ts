import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken, revokeAllUserTokens } from '@/lib/refresh-token'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { verifyToken } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { ObjectId } from 'mongodb'

/**
 * Logout endpoint
 * 
 * POST /api/auth/logout
 * 
 * Options:
 * - Body: { refreshToken: string } - Revoke specific refresh token
 * - No body: Revoke all refresh tokens for the authenticated user
 * 
 * Returns: { success: true, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { refreshToken } = body

    // If refresh token is provided, revoke only that token
    if (refreshToken) {
      const revoked = await revokeRefreshToken(refreshToken)
      if (revoked) {
        return NextResponse.json({
          success: true,
          message: 'Logged out successfully',
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'Token already invalid or not found',
        })
      }
    }

    // Otherwise, revoke all tokens for the authenticated user
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = new ObjectId(payload.userId)
    const revokedCount = await revokeAllUserTokens(userId)

    logger.info(`User ${payload.userId} logged out. Revoked ${revokedCount} refresh tokens.`)

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      revokedTokens: revokedCount,
    })
  } catch (error: any) {
    logger.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
