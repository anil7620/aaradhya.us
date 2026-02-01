import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getProductById } from '@/lib/products'
import { verifyCSRFForRequest } from '@/lib/csrf-middleware'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger } from '@/lib/logger'
import type { Cart } from '@/lib/models/Cart'

// This endpoint syncs localStorage cart items to database after login/register
export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = verifyCSRFForRequest(request)
    if (csrfError) {
      return csrfError
    }

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can sync cart' },
        { status: 403 }
      )
    }

    const { items } = await request.json() // items from localStorage

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to sync' })
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    // Get existing cart
    let cart = await db.collection<Cart>('carts').findOne({ userId })

    // Validate and prepare items
    const validItems = []
    for (const item of items) {
      try {
        const product = await getProductById(item.productId)
        if (product && product.isActive && product.stock > 0) {
          const quantity = Math.min(item.quantity || 1, product.stock)
          validItems.push({
            productId: new ObjectId(item.productId),
            quantity,
            price: product.price,
            selectedColor: item.selectedColor,
            selectedFragrance: item.selectedFragrance,
            addedAt: new Date(),
          })
        }
      } catch (err) {
        logger.error(`Error validating product ${item.productId}:`, err)
        // Skip invalid products
      }
    }

    if (validItems.length === 0) {
      return NextResponse.json({ success: true, message: 'No valid items to sync' })
    }

    if (!cart) {
      // Create new cart with synced items
      const newCart: Cart = {
        userId,
        items: validItems,
        updatedAt: new Date(),
      }
      await db.collection<Cart>('carts').insertOne(newCart)
    } else {
      // Merge with existing cart (avoid duplicates, update quantities)
      // Match by productId AND selections (color/fragrance)
      const mergedItems = [...cart.items]
      validItems.forEach((newItem) => {
        const existingIndex = mergedItems.findIndex(
          (item) => item.productId.toString() === newItem.productId.toString() &&
                    item.selectedColor === newItem.selectedColor &&
                    item.selectedFragrance === newItem.selectedFragrance
        )
        if (existingIndex >= 0) {
          // Update quantity for same product with same selections
          const product = mergedItems[existingIndex]
          mergedItems[existingIndex] = {
            ...product,
            quantity: product.quantity + newItem.quantity,
          }
        } else {
          // Add as new item (different selections or new product)
          mergedItems.push(newItem)
        }
      })

      await db.collection<Cart>('carts').updateOne(
        { userId },
        {
          $set: {
            items: mergedItems,
            updatedAt: new Date(),
          },
        }
      )
    }

    return NextResponse.json({ success: true, message: 'Cart synced successfully' })
  } catch (error) {
    logger.error('Error syncing cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

