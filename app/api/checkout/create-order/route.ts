import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { createCheckoutSession } from '@/lib/stripe'
import { getProductById } from '@/lib/products'
import { calculateTaxForItems } from '@/lib/tax'
import { verifyCSRFForRequest } from '@/lib/csrf-middleware'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger, getSafeErrorMessage } from '@/lib/logger'
import { validateObjectId } from '@/lib/validation'
import type { Cart } from '@/lib/models/Cart'
import type { Order, GuestOrderInfo, OrderItem } from '@/lib/models/Order'
import type { Address } from '@/lib/models/Address'

interface CreateOrderRequest {
  items?: Array<{
    productId: string
    quantity: number
    selectedColor?: string
    selectedFragrance?: string
  }>
  addressId?: string // For authenticated users with saved addresses
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
    // CSRF Protection
    const csrfError = verifyCSRFForRequest(request)
    if (csrfError) {
      return csrfError
    }

    const token = getTokenFromRequest(request)
    const body: CreateOrderRequest = await request.json()
    const { items, addressId, shippingAddress, guestInfo } = body

    let finalShippingAddress = shippingAddress
    let shippingAddressId: ObjectId | undefined
    let shippingAddressSnapshot: any = undefined

    // If addressId is provided, fetch the saved address
    if (addressId && token) {
      const payload = verifyToken(token)
      if (payload && payload.role === 'customer') {
        const client = await clientPromise
        const db = client.db()
        const userId = new ObjectId(payload.userId)
        const addressObjectId = validateObjectId(addressId)
        
        if (addressObjectId) {
          const savedAddress = await db
            .collection('addresses')
            .findOne({ _id: addressObjectId, userId })
          
          if (savedAddress) {
            // Use saved address
            finalShippingAddress = {
              street: savedAddress.street,
              city: savedAddress.city,
              state: savedAddress.state,
              zipCode: savedAddress.zipCode,
              country: savedAddress.country,
            }
            shippingAddressId = addressObjectId
            
            // Create snapshot
            shippingAddressSnapshot = {
              label: savedAddress.label,
              type: savedAddress.type,
              street: savedAddress.street,
              city: savedAddress.city,
              state: savedAddress.state,
              zipCode: savedAddress.zipCode,
              country: savedAddress.country,
              savedAt: savedAddress.createdAt,
            }
          }
        }
      }
    }

    // Validate shipping address
    if (!finalShippingAddress || !finalShippingAddress.street || !finalShippingAddress.city || 
        !finalShippingAddress.state || !finalShippingAddress.zipCode || !finalShippingAddress.country) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      )
    }

    // Validate state code (must be 2-letter US state code)
    const stateCode = finalShippingAddress.state.toUpperCase().trim()
    if (stateCode.length !== 2) {
      return NextResponse.json(
        { error: 'State must be a valid 2-letter state code (e.g., CA, NY, TX)' },
        { status: 400 }
      )
    }

    let userId: ObjectId | undefined
    let orderItems: OrderItem[] = []
    const itemsForTaxCalculation: Array<{ price: number; quantity: number }> = []

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
        })
      }
    }

    // Calculate US sales tax based on shipping state
    const taxCalculation = await calculateTaxForItems(itemsForTaxCalculation, stateCode)
    
    // Add tax details to order items
    const taxRate = taxCalculation.taxRate
    orderItems = orderItems.map((item) => {
      const itemSubtotal = item.price * item.quantity
      const itemTax = (itemSubtotal * taxRate) / 100
      return {
        ...item,
        taxRate,
        taxAmount: Math.round(itemTax * 100) / 100,
      }
    })

    // Convert amount to cents (USD uses smallest currency unit)
    const amountInCents = Math.round(taxCalculation.totalAmount * 100)

    // Create order in database first
    const client = await clientPromise
    const db = client.db()
    const orderId = new ObjectId()
    const orderNumber = `ORD-${orderId.toString().slice(-8).toUpperCase()}`

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000'
    const checkoutSession = await createCheckoutSession({
      amount: amountInCents,
      currency: 'usd',
      orderId: orderId.toString(),
      customerEmail: guestInfo?.email,
      customerName: guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}` : undefined,
      successUrl: `${baseUrl}/checkout/success?orderId=${orderId.toString()}`,
      cancelUrl: `${baseUrl}/checkout?canceled=true`,
      metadata: {
        orderNumber,
        userId: userId?.toString() || 'guest',
        email: guestInfo?.email || '',
      },
    })

    // Create order in database with address snapshot
    const order: Order = {
      _id: orderId,
      customerId: userId,
      guestInfo: guestInfo ? {
        ...guestInfo,
        email: guestInfo.email.toLowerCase().trim(), // Normalize email for consistent lookup
      } : undefined,
      items: orderItems,
      subtotal: taxCalculation.subtotal,
      taxAmount: taxCalculation.taxAmount,
      totalAmount: taxCalculation.totalAmount,
      status: 'pending',
      shippingAddressId: shippingAddressId, // Reference to saved address (if used)
      shippingAddress: {
        ...finalShippingAddress,
        state: stateCode, // Store normalized state code
      },
      shippingAddressSnapshot: shippingAddressSnapshot || {
        // Create snapshot even if not from saved address
        street: finalShippingAddress.street,
        city: finalShippingAddress.city,
        state: stateCode,
        zipCode: finalShippingAddress.zipCode,
        country: finalShippingAddress.country,
      },
      payment: {
        stripeCheckoutSessionId: checkoutSession.id,
        paymentStatus: 'pending',
        amount: amountInCents,
        currency: 'usd',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<Order>('orders').insertOne(order)

    return NextResponse.json({
      success: true,
      orderId: orderId.toString(),
      orderNumber,
      checkoutSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      amount: amountInCents,
      currency: 'usd',
      subtotal: taxCalculation.subtotal,
      taxAmount: taxCalculation.taxAmount,
      taxRate: taxCalculation.taxRate,
      totalAmount: taxCalculation.totalAmount,
    })
  } catch (error: any) {
    logger.error('Error creating order:', error)
    const errorMessage = getSafeErrorMessage(
      'Failed to create order',
      error.message || 'Failed to create order'
    )
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
