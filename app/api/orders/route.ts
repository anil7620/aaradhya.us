import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger } from '@/lib/logger'
import { Order } from '@/lib/models/Order'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)
    const userEmail = payload.email.toLowerCase().trim()

    // Find orders where:
    // 1. customerId matches userId (registered user orders), OR
    // 2. guestInfo.email matches user email (guest orders placed with this email, not yet associated)
    const orders = await db
      .collection<Order>('orders')
      .find({
        $or: [
          { customerId: userId },
          { 'guestInfo.email': userEmail },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    const formatted = orders.map((order) => ({
      id: order._id?.toString(),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        selectedColor: item.selectedColor,
        selectedFragrance: item.selectedFragrance,
      })),
    }))

    return NextResponse.json({ orders: formatted })
  } catch (error) {
    logger.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}


