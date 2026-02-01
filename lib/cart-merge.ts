/**
 * Cart Merging Utility
 * Handles merging guest cart with user cart upon login
 * Follows industry best practices for cart persistence
 */

import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getProductById } from '@/lib/products'
import { logger } from '@/lib/logger'
import type { Cart } from '@/lib/models/Cart'

/**
 * Merge guest cart with user cart upon login
 * - Combines items from both carts
 * - Updates quantities for duplicate items
 * - Removes invalid/inactive products
 * - Preserves user cart preferences (e.g., selectedColor, selectedFragrance)
 */
export async function mergeGuestCartWithUserCart(
  userId: ObjectId,
  sessionId: string
): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get both carts
    const userCart = await db.collection<Cart>('carts').findOne({ userId })
    const guestCart = await db
      .collection<Cart>('carts')
      .findOne({ sessionId })

    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart to merge
      return
    }

    if (!userCart) {
      // User has no cart, convert guest cart to user cart
      await db.collection<Cart>('carts').updateOne(
        { sessionId },
        {
          $set: {
            userId,
            sessionId: undefined, // Remove sessionId
            updatedAt: new Date(),
          },
          $unset: { sessionId: '' },
        }
      )
      return
    }

    // Merge carts
    const mergedItems = [...userCart.items]

    for (const guestItem of guestCart.items) {
      // Validate product still exists and is active
      const product = await getProductById(guestItem.productId.toString())
      if (!product || !product.isActive) {
        continue // Skip invalid products
      }

      // Check if same product with same selections exists in user cart
      const existingIndex = mergedItems.findIndex(
        (item) =>
          item.productId.toString() === guestItem.productId.toString() &&
          item.selectedColor === guestItem.selectedColor &&
          item.selectedFragrance === guestItem.selectedFragrance
      )

      if (existingIndex >= 0) {
        // Update quantity (add guest quantity to user quantity)
        const newQuantity =
          mergedItems[existingIndex].quantity + guestItem.quantity

        // Check stock availability
        if (product.stock >= newQuantity) {
          mergedItems[existingIndex].quantity = newQuantity
          // Update price to current product price
          mergedItems[existingIndex].price = product.price
        } else {
          // Set to max available stock
          mergedItems[existingIndex].quantity = product.stock
          mergedItems[existingIndex].price = product.price
        }
      } else {
        // Add as new item
        mergedItems.push({
          ...guestItem,
          price: product.price, // Update to current price
        })
      }
    }

    // Update user cart with merged items
    await db.collection<Cart>('carts').updateOne(
      { userId },
      {
        $set: {
          items: mergedItems,
          updatedAt: new Date(),
        },
      }
    )

    // Delete guest cart after merge
    await db.collection<Cart>('carts').deleteOne({ sessionId })

    logger.info(`Merged guest cart (${sessionId}) with user cart (${userId})`)
  } catch (error) {
    logger.error('Error merging carts:', error)
    // Don't throw - cart merging failure shouldn't block login
  }
}

/**
 * Merge guest wishlist with user wishlist upon login
 */
export async function mergeGuestWishlistWithUserWishlist(
  userId: ObjectId,
  sessionId: string
): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get both wishlists
    const userWishlist = await db
      .collection('wishlists')
      .findOne({ userId })
    const guestWishlist = await db
      .collection('wishlists')
      .findOne({ sessionId })

    if (!guestWishlist || guestWishlist.productIds.length === 0) {
      // No guest wishlist to merge
      return
    }

    if (!userWishlist) {
      // User has no wishlist, convert guest wishlist to user wishlist
      await db.collection('wishlists').updateOne(
        { sessionId },
        {
          $set: {
            userId,
            sessionId: undefined,
            updatedAt: new Date(),
          },
          $unset: { sessionId: '' },
        }
      )
      return
    }

    // Merge wishlists (use $addToSet to avoid duplicates)
    const allProductIds = [
      ...userWishlist.productIds.map((id: ObjectId) => id.toString()),
      ...guestWishlist.productIds.map((id: ObjectId) => id.toString()),
    ]

    // Remove duplicates and convert back to ObjectIds
    const uniqueProductIds = Array.from(new Set(allProductIds)).map(
      (id) => new ObjectId(id)
    )

    // Update user wishlist
    await db.collection('wishlists').updateOne(
      { userId },
      {
        $set: {
          productIds: uniqueProductIds,
          updatedAt: new Date(),
        },
      }
    )

    // Delete guest wishlist after merge
    await db.collection('wishlists').deleteOne({ sessionId })

    logger.info(
      `Merged guest wishlist (${sessionId}) with user wishlist (${userId})`
    )
  } catch (error) {
    logger.error('Error merging wishlists:', error)
    // Don't throw - wishlist merging failure shouldn't block login
  }
}
