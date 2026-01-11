import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getProductById } from '@/lib/products'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import type { Cart } from '@/lib/models/Cart'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can add items to cart' },
        { status: 403 }
      )
    }

    const { productId, quantity, selectedColor, selectedFragrance } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
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

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(payload.userId)

    // Find or create cart
    let cart = await db.collection<Cart>('carts').findOne({ userId })
    
    const productObjectId = new ObjectId(productId)
    const newItem = {
      productId: productObjectId,
      quantity: Number(quantity),
      price: product.price,
      selectedColor: selectedColor || undefined,
      selectedFragrance: selectedFragrance || undefined,
      addedAt: new Date(),
    }

    if (!cart) {
      // Create new cart
      const newCart: Cart = {
        userId,
        items: [newItem],
        updatedAt: new Date(),
      }
      await db.collection<Cart>('carts').insertOne(newCart)
    } else {
      // Check if product with same selections already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId &&
                  item.selectedColor === (selectedColor || undefined) &&
                  item.selectedFragrance === (selectedFragrance || undefined)
      )

      if (existingItemIndex >= 0) {
        // Update quantity for existing item with same selections
        const updatedItems = [...cart.items]
        const newQuantity = updatedItems[existingItemIndex].quantity + Number(quantity)
        
        if (product.stock < newQuantity) {
          return NextResponse.json(
            { error: 'Insufficient stock' },
            { status: 400 }
          )
        }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        }
        
        await db.collection<Cart>('carts').updateOne(
          { userId },
          { $set: { items: updatedItems, updatedAt: new Date() } }
        )
      } else {
        // Add new item (different selections or new product)
        await db.collection<Cart>('carts').updateOne(
          { userId },
          {
            $push: { items: newItem },
            $set: { updatedAt: new Date() },
          }
        )
      }
    }

    return NextResponse.json({ success: true, message: 'Added to cart' })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

