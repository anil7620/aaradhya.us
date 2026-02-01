import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, generateTokenPair } from '@/lib/auth'
import { UserRoleType } from '@/lib/models/User'
import { associateGuestOrdersWithUser } from '@/lib/orders'
import { getSessionIdFromRequest } from '@/lib/session'
import {
  mergeGuestCartWithUserCart,
  mergeGuestWishlistWithUserWishlist,
} from '@/lib/cart-merge'
import { storeRefreshToken } from '@/lib/refresh-token'
import { logger } from '@/lib/logger'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber,
      acceptTerms,
      joinPromotions,
      role = 'customer' 
    } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required' },
        { status: 400 }
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      )
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      )
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      )
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character' },
        { status: 400 }
      )
    }

    // Only allow customer registration (admin must be created via script)
    if (role !== 'customer') {
      return NextResponse.json(
        { error: 'Invalid role. Only customers can register.' },
        { status: 400 }
      )
    }

    // Normalize email for consistent storage and lookup
    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await getUserByEmail(normalizedEmail)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const user = await createUser(
      firstName,
      lastName,
      normalizedEmail,
      password,
      role as UserRoleType,
      phoneNumber,
      acceptTerms,
      joinPromotions
    )

    // Associate any guest orders with this email to the new user account
    let associatedOrdersCount = 0
    try {
      associatedOrdersCount = await associateGuestOrdersWithUser(user._id!, normalizedEmail)
    } catch (error) {
      // Log error but don't fail registration if order association fails
      logger.error('Error associating guest orders:', error)
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id!.toString(),
      email: normalizedEmail,
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

    // Merge guest cart and wishlist with user cart/wishlist upon registration
    const sessionId = getSessionIdFromRequest(request)
    if (sessionId) {
      await mergeGuestCartWithUserCart(user._id!, sessionId)
      await mergeGuestWishlistWithUserWishlist(user._id!, sessionId)
    }

    const redirect = '/products'

    return NextResponse.json({ 
      token: accessToken, // Keep 'token' for backward compatibility
      accessToken, // New field name
      refreshToken,
      redirect,
      associatedOrdersCount, // Return count for potential UI feedback
    })
  } catch (error) {
    logger.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

