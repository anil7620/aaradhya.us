import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger } from '@/lib/logger'
import { Order } from '@/lib/models/Order'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db()
    const orders = await db
      .collection<Order>('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const formatted = orders.map((order) => {
      // Backward compatibility: handle old orders with gstAmount instead of taxAmount
      const taxAmount = order.taxAmount ?? (order as any).gstAmount ?? 0
      
      return {
        id: order._id?.toString(),
        customerId: order.customerId?.toString() || null,
        guestInfo: order.guestInfo || null,
        subtotal: order.subtotal,
        taxAmount: taxAmount,
        totalAmount: order.totalAmount,
        status: order.status,
        shippingAddress: order.shippingAddress,
        payment: order.payment || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor,
          selectedFragrance: item.selectedFragrance,
        })),
      }
    })

    return NextResponse.json({ orders: formatted })
  } catch (error) {
    logger.error('Error fetching admin orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}


