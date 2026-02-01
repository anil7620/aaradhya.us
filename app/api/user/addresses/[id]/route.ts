import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { verifyCSRFForRequest } from '@/lib/csrf-middleware'
import { logger } from '@/lib/logger'
import { validateObjectId } from '@/lib/validation'
import type { Address } from '@/lib/models/Address'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const addressId = validateObjectId(params.id)
    if (!addressId) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 })
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

    // Verify address belongs to user
    const existingAddress = await db
      .collection<Address>('addresses')
      .findOne({ _id: addressId, userId })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.collection<Address>('addresses').updateMany(
        { userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      )
    }

    await db.collection<Address>('addresses').updateOne(
      { _id: addressId, userId },
      {
        $set: {
          label: label || undefined,
          type: type || 'OTHER',
          street,
          city,
          state: stateCode,
          zipCode,
          country,
          isDefault: isDefault || false,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error updating address:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const addressId = validateObjectId(params.id)
    if (!addressId) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    const result = await db
      .collection<Address>('addresses')
      .deleteOne({ _id: addressId, userId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
