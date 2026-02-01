/**
 * Password Reset Security Utilities
 * 
 * This module provides secure utilities for implementing password reset functionality.
 * These functions follow OWASP best practices for password reset security.
 * 
 * Security Requirements:
 * - Time-limited, single-use tokens
 * - Secure token generation (cryptographically random)
 * - Token expiration (typically 15-60 minutes)
 * - Rate limiting on reset requests
 * - Password history tracking (prevent reusing last N passwords)
 * - Audit logging of password changes
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
 */

import crypto from 'crypto'
import { hashPassword } from './auth'
import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

/**
 * Password reset token configuration
 */
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour
const RESET_TOKEN_BYTES = 32 // 256-bit token

/**
 * Password history configuration
 */
const PASSWORD_HISTORY_LIMIT = 5 // Prevent reusing last 5 passwords

/**
 * Interface for password reset token stored in database
 */
export interface PasswordResetToken {
  userId: ObjectId
  token: string // Hashed token
  expiresAt: Date
  used: boolean
  createdAt: Date
  ipAddress?: string // For audit logging
}

/**
 * Generate a cryptographically secure password reset token
 * 
 * @returns Object containing the token (to send to user) and hashed token (to store in DB)
 */
export function generatePasswordResetToken(): { token: string; hashedToken: string } {
  // Generate cryptographically secure random token
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex')
  
  // Hash the token before storing (similar to password hashing)
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  
  return { token, hashedToken }
}

/**
 * Verify a password reset token
 * 
 * @param token - Token provided by user
 * @param hashedToken - Hashed token stored in database
 * @param expiresAt - Expiration date of the token
 * @param used - Whether the token has already been used
 * @returns true if token is valid, false otherwise
 */
export function verifyPasswordResetToken(
  token: string,
  hashedToken: string,
  expiresAt: Date,
  used: boolean
): boolean {
  // Check if token has been used
  if (used) {
    return false
  }
  
  // Check if token has expired
  if (new Date() > expiresAt) {
    return false
  }
  
  // Verify token hash
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  
  return tokenHash === hashedToken
}

/**
 * Store password reset token in database
 * 
 * @param userId - User ID requesting password reset
 * @param hashedToken - Hashed token to store
 * @param ipAddress - IP address of the request (for audit)
 * @returns Promise resolving when token is stored
 */
export async function storePasswordResetToken(
  userId: ObjectId,
  hashedToken: string,
  ipAddress?: string
): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)
  
  // Invalidate any existing unused tokens for this user
  await db.collection<PasswordResetToken>('password_reset_tokens').updateMany(
    { userId, used: false },
    { $set: { used: true } }
  )
  
  // Store new token
  await db.collection<PasswordResetToken>('password_reset_tokens').insertOne({
    userId,
    token: hashedToken,
    expiresAt,
    used: false,
    createdAt: new Date(),
    ipAddress,
  })
}

/**
 * Mark password reset token as used
 * 
 * @param hashedToken - Hashed token to mark as used
 */
export async function markTokenAsUsed(hashedToken: string): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  
  await db.collection<PasswordResetToken>('password_reset_tokens').updateOne(
    { token: hashedToken },
    { $set: { used: true } }
  )
}

/**
 * Get password reset token from database
 * 
 * @param hashedToken - Hashed token to look up
 * @returns Password reset token or null if not found
 */
export async function getPasswordResetToken(
  hashedToken: string
): Promise<PasswordResetToken | null> {
  const client = await clientPromise
  const db = client.db()
  
  return await db.collection<PasswordResetToken>('password_reset_tokens').findOne({
    token: hashedToken,
  })
}

/**
 * Check if password was recently used (password history)
 * 
 * @param userId - User ID
 * @param newPasswordHash - Hash of the new password
 * @returns true if password was recently used, false otherwise
 */
export async function isPasswordInHistory(
  userId: ObjectId,
  newPasswordHash: string
): Promise<boolean> {
  const client = await clientPromise
  const db = client.db()
  
  // Get user's password history
  const user = await db.collection('users').findOne(
    { _id: userId },
    { projection: { passwordHistory: 1 } }
  )
  
  if (!user || !user.passwordHistory || !Array.isArray(user.passwordHistory)) {
    return false
  }
  
  // Check if new password matches any of the last N passwords
  const recentPasswords = user.passwordHistory.slice(-PASSWORD_HISTORY_LIMIT)
  return recentPasswords.includes(newPasswordHash)
}

/**
 * Add password to user's password history
 * 
 * @param userId - User ID
 * @param passwordHash - Hash of the password to add
 */
export async function addPasswordToHistory(
  userId: ObjectId,
  passwordHash: string
): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  
  // Get current password history
  const user = await db.collection('users').findOne(
    { _id: userId },
    { projection: { passwordHistory: 1 } }
  )
  
  const passwordHistory = user?.passwordHistory || []
  
  // Add new password and keep only last N passwords
  const updatedHistory = [...passwordHistory, passwordHash].slice(-PASSWORD_HISTORY_LIMIT)
  
  await db.collection('users').updateOne(
    { _id: userId },
    { $set: { passwordHistory: updatedHistory } }
  )
}

/**
 * Log password change event for audit purposes
 * 
 * @param userId - User ID
 * @param method - Method of password change ('reset' | 'change' | 'admin')
 * @param ipAddress - IP address of the request
 * @param userAgent - User agent string
 */
export async function logPasswordChange(
  userId: ObjectId,
  method: 'reset' | 'change' | 'admin',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  
  await db.collection('password_change_logs').insertOne({
    userId,
    method,
    ipAddress,
    userAgent,
    timestamp: new Date(),
  })
}

/**
 * Clean up expired password reset tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const client = await clientPromise
  const db = client.db()
  
  const result = await db.collection<PasswordResetToken>('password_reset_tokens').deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true },
    ],
  })
  
  return result.deletedCount
}
