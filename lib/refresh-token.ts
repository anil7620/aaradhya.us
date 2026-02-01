/**
 * Refresh Token Management
 * 
 * Provides secure refresh token storage, verification, and revocation.
 * Implements token rotation and revocation for enhanced security.
 * 
 * Security Features:
 * - Hashed token storage
 * - Token expiration
 * - Token revocation
 * - Device/session tracking
 * - Audit logging
 */

import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import { RefreshToken } from './models/RefreshToken'
import { logger } from './logger'

/**
 * Hash a refresh token before storing in database
 */
function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Store refresh token in database
 * 
 * @param userId - User ID
 * @param refreshToken - Plain refresh token (will be hashed)
 * @param deviceInfo - Optional device information
 * @param ipAddress - Optional IP address
 * @param userAgent - Optional user agent string
 * @returns Promise resolving when token is stored
 */
export async function storeRefreshToken(
  userId: ObjectId,
  refreshToken: string,
  deviceInfo?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  
  const hashedToken = hashRefreshToken(refreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  // Store refresh token
  await db.collection<RefreshToken>('refresh_tokens').insertOne({
    userId,
    token: hashedToken,
    deviceInfo,
    ipAddress,
    userAgent,
    expiresAt,
    revoked: false,
    createdAt: new Date(),
  })
}

/**
 * Verify refresh token and return user ID if valid
 * 
 * @param refreshToken - Plain refresh token to verify
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyRefreshToken(refreshToken: string): Promise<ObjectId | null> {
  const client = await clientPromise
  const db = client.db()
  
  const hashedToken = hashRefreshToken(refreshToken)
  
  const tokenDoc = await db.collection<RefreshToken>('refresh_tokens').findOne({
    token: hashedToken,
  })
  
  if (!tokenDoc) {
    return null
  }
  
  // Check if token is revoked
  if (tokenDoc.revoked) {
    return null
  }
  
  // Check if token is expired
  if (new Date() > tokenDoc.expiresAt) {
    return null
  }
  
  // Update last used timestamp
  await db.collection<RefreshToken>('refresh_tokens').updateOne(
    { _id: tokenDoc._id },
    { $set: { lastUsedAt: new Date() } }
  )
  
  return tokenDoc.userId
}

/**
 * Revoke a refresh token
 * 
 * @param refreshToken - Plain refresh token to revoke
 * @returns true if token was revoked, false if not found
 */
export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  const client = await clientPromise
  const db = client.db()
  
  const hashedToken = hashRefreshToken(refreshToken)
  
  const result = await db.collection<RefreshToken>('refresh_tokens').updateOne(
    { token: hashedToken, revoked: false },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    }
  )
  
  return result.matchedCount > 0
}

/**
 * Revoke all refresh tokens for a user
 * Useful for logout or security incidents
 * 
 * @param userId - User ID
 * @returns Number of tokens revoked
 */
export async function revokeAllUserTokens(userId: ObjectId): Promise<number> {
  const client = await clientPromise
  const db = client.db()
  
  const result = await db.collection<RefreshToken>('refresh_tokens').updateMany(
    { userId, revoked: false },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    }
  )
  
  return result.modifiedCount
}

/**
 * Revoke refresh token by ID (for admin or user management)
 * 
 * @param tokenId - Refresh token document ID
 * @returns true if token was revoked, false if not found
 */
export async function revokeTokenById(tokenId: ObjectId): Promise<boolean> {
  const client = await clientPromise
  const db = client.db()
  
  const result = await db.collection<RefreshToken>('refresh_tokens').updateOne(
    { _id: tokenId, revoked: false },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    }
  )
  
  return result.matchedCount > 0
}

/**
 * Get all active refresh tokens for a user
 * Useful for showing active sessions
 * 
 * @param userId - User ID
 * @returns Array of active refresh tokens (without hashed token values)
 */
export async function getUserRefreshTokens(userId: ObjectId): Promise<Array<Omit<RefreshToken, 'token'>>> {
  const client = await clientPromise
  const db = client.db()
  
  const tokens = await db.collection<RefreshToken>('refresh_tokens')
    .find({
      userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    })
    .sort({ createdAt: -1 })
    .toArray()
  
  // Remove token hash from response
  return tokens.map(({ token, ...rest }) => rest)
}

/**
 * Clean up expired and revoked tokens
 * Should be run periodically (e.g., daily cron job)
 * 
 * @returns Number of tokens deleted
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const client = await clientPromise
  const db = client.db()
  
  const result = await db.collection<RefreshToken>('refresh_tokens').deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revoked: true, revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Delete revoked tokens older than 30 days
    ],
  })
  
  return result.deletedCount
}
