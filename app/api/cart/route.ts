import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getProductById } from '@/lib/products'
import type { Cart } from '@/lib/models/Cart'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can view cart' },
        { status: 403 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    const cart = await db.collection<Cart>('carts').findOne({ userId })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ items: [], total: 0 })
    }

    // Fetch product details for each cart item
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await getProductById(item.productId.toString())
        return {
          productId: item.productId.toString(),
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor,
          selectedFragrance: item.selectedFragrance,
          category: product?.category,
          addedAt: item.addedAt,
          product: product
            ? {
                _id: product._id?.toString(),
                name: product.name,
                images: product.images,
                stock: product.stock,
                isActive: product.isActive,
                category: product.category,
              }
            : null,
        }
      })
    )

    // Filter out items with deleted/inactive products
    const validItems = itemsWithProducts.filter((item) => item.product && item.product.isActive)

    const total = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return NextResponse.json({
      items: validItems,
      total,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can modify cart' },
        { status: 403 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    await db.collection<Cart>('carts').updateOne(
      { userId },
      {
        $pull: { items: { productId: new ObjectId(productId) } },
        $set: { updatedAt: new Date() },
      }
    )

    return NextResponse.json({ success: true, message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can modify cart' },
        { status: 403 }
      )
    }

    const { productId, quantity } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      const client = await clientPromise
      const db = client.db()
      const userId = new ObjectId(payload.userId)

      await db.collection<Cart>('carts').updateOne(
        { userId },
        {
          $pull: { items: { productId: new ObjectId(productId) } },
          $set: { updatedAt: new Date() },
        }
      )

      return NextResponse.json({ success: true, message: 'Item removed from cart' })
    }

    const product = await getProductById(productId)
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    await db.collection<Cart>('carts').updateOne(
      {
        userId,
        'items.productId': new ObjectId(productId),
      },
      {
        $set: {
          'items.$.quantity': Number(quantity),
          'items.$.price': product.price,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true, message: 'Cart updated' })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

