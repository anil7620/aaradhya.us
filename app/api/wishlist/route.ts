/**
 * Wishlist API Endpoints
 * Handles wishlist operations for both authenticated users and guests
 */

import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getProductById } from '@/lib/products'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { getSessionIdFromRequest, isValidSessionId } from '@/lib/session'
import { verifyToken } from '@/lib/auth'
import { verifyCSRFForRequest } from '@/lib/csrf-middleware'
import { logger } from '@/lib/logger'
import { validateObjectId } from '@/lib/validation'
import type { Wishlist } from '@/lib/models/Wishlist'

/**
 * GET /api/wishlist
 * Get wishlist for authenticated user or guest
 */
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const sessionId = getSessionIdFromRequest(request)

    const client = await clientPromise
    const db = client.db()

    let wishlist: Wishlist | null = null

    if (token) {
      // Authenticated user
      const payload = verifyToken(token)
      if (payload && payload.role === 'customer') {
        const userId = new ObjectId(payload.userId)
        wishlist = await db
          .collection<Wishlist>('wishlists')
          .findOne({ userId })
      }
    } else if (sessionId && isValidSessionId(sessionId)) {
      // Guest user
      wishlist = await db
        .collection<Wishlist>('wishlists')
        .findOne({ sessionId })
    }

    if (!wishlist || wishlist.productIds.length === 0) {
      return NextResponse.json({ productIds: [] })
    }

    // Fetch product details
    const products = await Promise.all(
      wishlist.productIds.map(async (productId) => {
        const product = await getProductById(productId.toString())
        return product
          ? {
              _id: product._id?.toString(),
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              images: product.images,
              stock: product.stock,
              isActive: product.isActive,
            }
          : null
      })
    )

    const validProducts = products.filter((p) => p && p.isActive)

    return NextResponse.json({
      productIds: wishlist.productIds.map((id) => id.toString()),
      products: validProducts,
    })
  } catch (error) {
    logger.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/wishlist
 * Add product to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = verifyCSRFForRequest(request)
    if (csrfError) {
      return csrfError
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    const productObjectId = validateObjectId(productId)
    if (!productObjectId) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }

    const product = await getProductById(productId)
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      )
    }

    const token = getTokenFromRequest(request)
    const sessionId = getSessionIdFromRequest(request)

    const client = await clientPromise
    const db = client.db()

    if (token) {
      // Authenticated user
      const payload = verifyToken(token)
      if (!payload || payload.role !== 'customer') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const userId = new ObjectId(payload.userId)

      // Check if already in wishlist
      const existingWishlist = await db
        .collection<Wishlist>('wishlists')
        .findOne({ userId })

      if (existingWishlist) {
        // Check if product already exists
        const exists = existingWishlist.productIds.some(
          (id) => id.toString() === productId
        )

        if (exists) {
          return NextResponse.json({
            success: true,
            message: 'Product already in wishlist',
          })
        }

        // Add product
        await db.collection<Wishlist>('wishlists').updateOne(
          { userId },
          {
            $addToSet: { productIds: productObjectId },
            $set: { updatedAt: new Date() },
          }
        )
      } else {
        // Create new wishlist
        const newWishlist: Wishlist = {
          userId,
          productIds: [productObjectId],
          updatedAt: new Date(),
          createdAt: new Date(),
        }
        await db.collection<Wishlist>('wishlists').insertOne(newWishlist)
      }
    } else if (sessionId && isValidSessionId(sessionId)) {
      // Guest user
      const existingWishlist = await db
        .collection<Wishlist>('wishlists')
        .findOne({ sessionId })

      if (existingWishlist) {
        // Check if product already exists
        const exists = existingWishlist.productIds.some(
          (id) => id.toString() === productId
        )

        if (exists) {
          return NextResponse.json({
            success: true,
            message: 'Product already in wishlist',
          })
        }

        // Add product
        await db.collection<Wishlist>('wishlists').updateOne(
          { sessionId },
          {
            $addToSet: { productIds: productObjectId },
            $set: { updatedAt: new Date() },
          }
        )
      } else {
        // Create new wishlist
        const newWishlist: Wishlist = {
          sessionId,
          productIds: [productObjectId],
          updatedAt: new Date(),
          createdAt: new Date(),
        }
        await db.collection<Wishlist>('wishlists').insertOne(newWishlist)
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid session. Please refresh the page.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
    })
  } catch (error) {
    logger.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/wishlist
 * Remove product from wishlist
 */
export async function DELETE(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = verifyCSRFForRequest(request)
    if (csrfError) {
      return csrfError
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    const productObjectId = validateObjectId(productId)
    if (!productObjectId) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }

    const token = getTokenFromRequest(request)
    const sessionId = getSessionIdFromRequest(request)

    const client = await clientPromise
    const db = client.db()

    if (token) {
      // Authenticated user
      const payload = verifyToken(token)
      if (!payload || payload.role !== 'customer') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const userId = new ObjectId(payload.userId)

      await db.collection<Wishlist>('wishlists').updateOne(
        { userId },
        {
          $pull: { productIds: productObjectId },
          $set: { updatedAt: new Date() },
        }
      )
    } else if (sessionId && isValidSessionId(sessionId)) {
      // Guest user
      await db.collection<Wishlist>('wishlists').updateOne(
        { sessionId },
        {
          $pull: { productIds: productObjectId },
          $set: { updatedAt: new Date() },
        }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid session. Please refresh the page.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    })
  } catch (error) {
    logger.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
