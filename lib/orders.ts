import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import type { Order } from './models/Order'

/**
 * Associate guest orders with a user account when they register
 * This finds all orders placed as guest with the same email and links them to the user
 */
export async function associateGuestOrdersWithUser(
  userId: ObjectId,
  email: string
): Promise<number> {
  const client = await clientPromise
  const db = client.db()

  // Find all guest orders with this email that don't have a customerId yet
  const result = await db.collection<Order>('orders').updateMany(
    {
      'guestInfo.email': email.toLowerCase().trim(),
      customerId: { $exists: false },
    },
    {
      $set: {
        customerId: userId,
        updatedAt: new Date(),
      },
      $unset: {
        guestInfo: '', // Remove guestInfo since it's now a registered user order
      },
    }
  )

  return result.modifiedCount
}

/**
 * Get orders for a user (including guest orders associated by email)
 */
export async function getUserOrders(userId: ObjectId, email: string) {
  const client = await clientPromise
  const db = client.db()

  // Get orders where:
  // 1. customerId matches userId, OR
  // 2. guestInfo.email matches user email (for guest orders not yet associated)
  const orders = await db
    .collection<Order>('orders')
    .find({
      $or: [
        { customerId: userId },
        { 'guestInfo.email': email.toLowerCase().trim() },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray()

  return orders
}
