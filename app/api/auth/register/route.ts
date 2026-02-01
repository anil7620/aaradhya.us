import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, generateToken } from '@/lib/auth'
import { UserRoleType } from '@/lib/models/User'
import { associateGuestOrdersWithUser } from '@/lib/orders'
import { logger } from '@/lib/logger'

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

    const token = generateToken({
      userId: user._id!.toString(),
      email: normalizedEmail,
      role: user.role,
    })

    const redirect = '/dashboard'

    return NextResponse.json({ 
      token, 
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

