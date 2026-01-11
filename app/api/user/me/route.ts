import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { User } from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

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

    const client = await clientPromise
    const db = client.db()
    const user = await db.collection<User>('users').findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      _id: user._id?.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { firstName, lastName, phoneNumber } = await request.json()

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const updatedUser = await db.collection<User>('users').findOneAndUpdate(
      { _id: new ObjectId(payload.userId) },
      {
        $set: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(),
          phoneNumber,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
        projection: { password: 0 },
      }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      _id: updatedUser._id?.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

