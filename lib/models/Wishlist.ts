import { ObjectId } from 'mongodb'

/**
 * Wishlist model supporting both authenticated users and guest sessions
 * - userId: For authenticated users (required if sessionId is not present)
 * - sessionId: For guest users (required if userId is not present)
 * At least one must be present
 */
export interface Wishlist {
  _id?: ObjectId
  userId?: ObjectId // For authenticated users
  sessionId?: string // For guest users (UUID)
  productIds: ObjectId[] // Array of product IDs
  updatedAt: Date
  createdAt?: Date
}
