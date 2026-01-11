import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { createRazorpayOrder } from '@/lib/razorpay'
import { getProductById } from '@/lib/products'
import { calculateGSTForItems } from '@/lib/tax'
import type { Cart } from '@/lib/models/Cart'
import type { Order, GuestOrderInfo, OrderItem } from '@/lib/models/Order'

interface CreateOrderRequest {
  items?: Array<{
    productId: string
    quantity: number
    selectedColor?: string
    selectedFragrance?: string
  }>
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  guestInfo?: GuestOrderInfo
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const body: CreateOrderRequest = await request.json()
    const { items, shippingAddress, guestInfo } = body

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      )
    }

    let userId: ObjectId | undefined
    let orderItems: OrderItem[] = []
    const itemsForTaxCalculation: Array<{ price: number; quantity: number; category: string }> = []

    if (token) {
      // Logged-in user checkout
      const payload = verifyToken(token)
      if (!payload || payload.role !== 'customer') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      userId = new ObjectId(payload.userId)

      // Get cart items from database
      const client = await clientPromise
      const db = client.db()
      const cart = await db.collection<Cart>('carts').findOne({ userId })

      if (!cart || cart.items.length === 0) {
        return NextResponse.json(
          { error: 'Cart is empty' },
          { status: 400 }
        )
      }

      // Validate and prepare items with product details
      for (const item of cart.items) {
        const product = await getProductById(item.productId.toString())
        if (!product || !product.isActive) {
          continue // Skip invalid products
        }
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}` },
            { status: 400 }
          )
        }
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          selectedColor: item.selectedColor,
          selectedFragrance: item.selectedFragrance,
          category: product.category,
        })
        
        itemsForTaxCalculation.push({
          price: product.price,
          quantity: item.quantity,
          category: product.category,
        })
      }

      if (orderItems.length === 0) {
        return NextResponse.json(
          { error: 'No valid items in cart' },
          { status: 400 }
        )
      }
    } else {
      // Guest checkout
      if (!guestInfo || !guestInfo.email || !guestInfo.firstName || !guestInfo.lastName) {
        return NextResponse.json(
          { error: 'Guest information is required (email, firstName, lastName)' },
          { status: 400 }
        )
      }

      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'Items are required for guest checkout' },
          { status: 400 }
        )
      }

      // Validate and prepare items with product details
      for (const item of items) {
        const product = await getProductById(item.productId)
        if (!product || !product.isActive) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found or unavailable` },
            { status: 404 }
          )
        }
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}` },
            { status: 400 }
          )
        }
        
        orderItems.push({
          productId: new ObjectId(item.productId),
          quantity: item.quantity,
          price: product.price,
          selectedColor: item.selectedColor,
          selectedFragrance: item.selectedFragrance,
          category: product.category,
        })
        
        itemsForTaxCalculation.push({
          price: product.price,
          quantity: item.quantity,
          category: product.category,
        })
      }
    }

    // Calculate GST
    const taxCalculation = calculateGSTForItems(itemsForTaxCalculation)
    
    // Add GST details to order items
    const taxBreakdownMap = new Map<string, { rate: number; amount: number }>()
    taxCalculation.breakdown.forEach((item) => {
      taxBreakdownMap.set(item.category, { rate: item.gstRate, amount: item.itemGST })
    })
    
    orderItems = orderItems.map((item) => {
      if (item.category) {
        const taxInfo = taxBreakdownMap.get(item.category)
        if (taxInfo) {
          // Distribute GST proportionally per item
          const itemSubtotal = item.price * item.quantity
          const itemGST = (itemSubtotal * taxInfo.rate) / 100
          return {
            ...item,
            gstRate: taxInfo.rate,
            gstAmount: Math.round(itemGST * 100) / 100,
          }
        }
      }
      return item
    })

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(taxCalculation.totalAmount * 100)

    // Create order in database first
    const client = await clientPromise
    const db = client.db()
    const orderId = new ObjectId()
    const receipt = `order_${orderId.toString()}`

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        order_id: orderId.toString(),
        user_id: userId?.toString() || 'guest',
        email: guestInfo?.email || '',
      },
    })

    // Create order in database
    const order: Order = {
      _id: orderId,
      customerId: userId,
      guestInfo: guestInfo ? {
        ...guestInfo,
        email: guestInfo.email.toLowerCase().trim(), // Normalize email for consistent lookup
      } : undefined,
      items: orderItems,
      subtotal: taxCalculation.subtotal,
      gstAmount: taxCalculation.gstAmount,
      totalAmount: taxCalculation.totalAmount,
      status: 'pending',
      shippingAddress,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: 'pending',
        amount: amountInPaise,
        currency: 'INR',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<Order>('orders').insertOne(order)

    return NextResponse.json({
      success: true,
      orderId: orderId.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
      subtotal: taxCalculation.subtotal,
      gstAmount: taxCalculation.gstAmount,
      totalAmount: taxCalculation.totalAmount,
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
