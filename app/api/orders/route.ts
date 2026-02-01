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

    // Security: Only show orders owned by the authenticated user
    // For authenticated users, we only show orders where customerId matches their user ID.
    // Guest orders should have been associated with the user account during registration
    // via associateGuestOrdersWithUser(). If they weren't, we still only show orders
    // with matching customerId to prevent email-based access control exploitation.
    
    // Find orders where customerId matches userId (registered user orders only)
    // This ensures strong ownership verification based on user ID, not email
    const orders = await db
      .collection<Order>('orders')
      .find({
        customerId: userId,
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()
    
    // If no orders found, check if there are unassociated guest orders that should be linked
    // This handles edge cases where association might have failed during registration
    if (orders.length === 0) {
      // Check if there are any unassociated guest orders with this email
      const unassociatedGuestOrders = await db
        .collection<Order>('orders')
        .find({
          'guestInfo.email': userEmail,
          customerId: { $exists: false },
        })
        .limit(1)
        .toArray()
      
      // If unassociated guest orders exist, attempt to associate them now
      if (unassociatedGuestOrders.length > 0) {
        const { associateGuestOrdersWithUser } = await import('@/lib/orders')
        try {
          await associateGuestOrdersWithUser(userId, userEmail)
          // Retry query after association
          const associatedOrders = await db
            .collection<Order>('orders')
            .find({
              customerId: userId,
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray()
          
          // Use associated orders if found
          if (associatedOrders.length > 0) {
            const formatted = associatedOrders.map((order) => ({
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
          }
        } catch (error) {
          // Log error but don't expose guest orders
          logger.error('Error associating guest orders:', error)
        }
      }
    }

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


