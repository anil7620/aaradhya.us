import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from './mongodb'
import { User, UserRole, UserRoleType } from './models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRoleType
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
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

