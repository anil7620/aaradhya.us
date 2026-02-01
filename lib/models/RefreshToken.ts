import { ObjectId } from 'mongodb'

/**
 * Refresh Token Model
 * 
 * Stores refresh tokens in the database to enable:
 * - Token revocation
 * - Token rotation
 * - Audit logging
 * - Device/session management
 */
export interface RefreshToken {
  _id?: ObjectId
  userId: ObjectId
  token: string // Hashed refresh token
  deviceInfo?: string // Device/browser information
  ipAddress?: string // IP address when token was created
  userAgent?: string // User agent string
  expiresAt: Date
  revoked: boolean
  revokedAt?: Date
  createdAt: Date
  lastUsedAt?: Date
}
