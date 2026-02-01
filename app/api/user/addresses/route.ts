import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { verifyCSRFForRequest } from '@/lib/csrf-middleware'
import { logger } from '@/lib/logger'
import type { Address } from '@/lib/models/Address'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    // Order by: default first, then by creation date (newest first)
    const addresses = await db
      .collection<Address>('addresses')
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .toArray()

    return NextResponse.json({
      addresses: addresses.map(addr => ({
        id: addr._id?.toString(),
        label: addr.label,
        type: addr.type || 'OTHER',
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        isDefault: addr.isDefault || false,
        createdAt: addr.createdAt,
        updatedAt: addr.updatedAt,
      })),
    })
  } catch (error) {
    logger.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = verifyCSRFForRequest(request)
    if (csrfError) return csrfError

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { label, type, street, city, state, zipCode, country, isDefault } = body

    if (!street || !city || !state || !zipCode || !country) {
      return NextResponse.json(
        { error: 'All address fields are required' },
        { status: 400 }
      )
    }

    const stateCode = state.toUpperCase().trim()
    if (stateCode.length !== 2) {
      return NextResponse.json(
        { error: 'State must be a valid 2-letter state code' },
        { status: 400 }
      )
    }

    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(zipCode)) {
      return NextResponse.json(
        { error: 'ZIP code must be in format 12345 or 12345-6789' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.collection<Address>('addresses').updateMany(
        { userId },
        { $set: { isDefault: false } }
      )
    }

    const address: Address = {
      userId,
      label: label || undefined,
      type: type || 'OTHER',
      street,
      city,
      state: stateCode,
      zipCode,
      country,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Address>('addresses').insertOne(address)

    return NextResponse.json({
      success: true,
      address: {
        id: result.insertedId.toString(),
        ...address,
        _id: undefined,
      },
    })
  } catch (error) {
    logger.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
