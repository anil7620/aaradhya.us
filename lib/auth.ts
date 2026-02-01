import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from './mongodb'
import { User, UserRole, UserRoleType } from './models/User'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in your .env.local file.')
}

// TypeScript assertion: after the check above, JWT_SECRET is guaranteed to be a string
const JWT_SECRET_STRING: string = JWT_SECRET

export interface JWTPayload {
  userId: string
  email: string
  role: UserRoleType
  type?: 'access' | 'refresh' // Token type for access vs refresh tokens
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate access token (short-lived, 24 hours)
 * Used for API authentication
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET_STRING,
    { expiresIn: '24h' }
  )
}

/**
 * Generate refresh token (longer-lived, 7 days)
 * Used to obtain new access tokens without re-authentication
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET_STRING,
    { expiresIn: '7d' }
  )
}

/**
 * Generate both access and refresh tokens
 * 
 * @param payload - User payload for access token
 * @returns Object containing both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateToken(payload)
  const refreshToken = generateRefreshToken(payload.userId)
  return { accessToken, refreshToken }
}

/**
 * Verify JWT token
 * 
 * @param token - JWT token to verify
 * @param requireAccessToken - If true, only accept access tokens (default: false for backward compatibility)
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string, requireAccessToken: boolean = false): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET_STRING) as JWTPayload & { exp?: number }
    
    // If requireAccessToken is true, reject refresh tokens
    if (requireAccessToken && payload.type === 'refresh') {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise
  const db = client.db()
  // Normalize email for consistent lookup
  const normalizedEmail = email.toLowerCase().trim()
  return db.collection<User>('users').findOne({ email: normalizedEmail })
}

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: UserRole = UserRole.CUSTOMER,
  phoneNumber?: string,
  acceptTerms: boolean = false,
  joinPromotions: boolean = false
): Promise<User> {
  const client = await clientPromise
  const db = client.db()
  
  // Normalize email to ensure consistency with getUserByEmail()
  // This enforces the invariant that all emails are stored in lowercase and trimmed
  const normalizedEmail = email.toLowerCase().trim()
  
  const hashedPassword = await hashPassword(password)
  const fullName = `${firstName} ${lastName}`.trim()
  const user: User = {
    firstName,
    lastName,
    name: fullName, // For backward compatibility
    email: normalizedEmail,
    phoneNumber,
    password: hashedPassword,
    role,
    acceptTerms,
    joinPromotions,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db.collection<User>('users').insertOne(user)
  user._id = result.insertedId
  return user
}

