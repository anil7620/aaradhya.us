import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getCheckoutSession } from '@/lib/stripe'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger, getSafeErrorMessage } from '@/lib/logger'
import { validateObjectId } from '@/lib/validation'
import type { Order } from '@/lib/models/Order'
import type { Cart } from '@/lib/models/Cart'

interface VerifyPaymentRequest {
  orderId: string
  checkoutSessionId: string
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const body: VerifyPaymentRequest = await request.json()
    const { orderId, checkoutSessionId } = body

    if (!orderId || !checkoutSessionId) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      )
    }

    // Retrieve checkout session from Stripe
    const checkoutSession = await getCheckoutSession(checkoutSessionId)

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: `Payment not successful. Status: ${checkoutSession.payment_status}` },
        { status: 400 }
      )
    }

    // Update order in database
    // Validate ObjectId format
    const orderObjectId = validateObjectId(orderId)
    if (!orderObjectId) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const order = await db.collection<Order>('orders').findOne({ _id: orderObjectId })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // CRITICAL SECURITY: Verify the user owns this order
    let isAuthorized = false

    if (token) {
      // Authenticated user - verify ownership via customerId
      const payload = verifyToken(token)
      if (payload) {
        const userId = new ObjectId(payload.userId)
        const userEmail = payload.email.toLowerCase().trim()
        
        // Check if order belongs to authenticated user
        if (order.customerId && order.customerId.equals(userId)) {
          isAuthorized = true
        } else if (order.guestInfo?.email?.toLowerCase().trim() === userEmail) {
          // Edge case: user registered after placing guest order with same email
          isAuthorized = true
        }
      }
    } else {
      // Guest order - verify via email from checkout session metadata or request body
      const sessionEmail = checkoutSession.customer_email || 
                         checkoutSession.customer_details?.email ||
                         checkoutSession.metadata?.email
      
      if (sessionEmail && order.guestInfo?.email) {
        const sessionEmailNormalized = sessionEmail.toLowerCase().trim()
        const orderEmailNormalized = order.guestInfo.email.toLowerCase().trim()
        
        if (sessionEmailNormalized === orderEmailNormalized) {
          isAuthorized = true
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to verify this order' },
        { status: 403 }
      )
    }

    // Verify the Stripe checkout session ID matches
    if (order.payment?.stripeCheckoutSessionId !== checkoutSessionId) {
      return NextResponse.json(
        { error: 'Order ID mismatch' },
        { status: 400 }
      )
    }

    // Update order with payment details
    await db.collection<Order>('orders').updateOne(
      { _id: orderObjectId },
      {
        $set: {
          'payment.stripePaymentId': checkoutSession.payment_intent as string,
          'payment.paymentStatus': 'succeeded',
          status: 'processing',
          updatedAt: new Date(),
        },
      }
    )

    // If logged in, clear the cart
    if (token) {
      const payload = verifyToken(token)
      if (payload && payload.role === 'customer') {
        const userId = new ObjectId(payload.userId)
        await db.collection<Cart>('carts').deleteOne({ userId })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: orderId,
      paymentStatus: checkoutSession.payment_status,
    })
  } catch (error: any) {
    logger.error('Error verifying payment:', error)
    const errorMessage = getSafeErrorMessage(
      'Failed to verify payment',
      error.message || 'Failed to verify payment'
    )
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
