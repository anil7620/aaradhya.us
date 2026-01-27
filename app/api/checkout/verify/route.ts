import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getCheckoutSession } from '@/lib/stripe'
import type { Order } from '@/lib/models/Order'
import type { Cart } from '@/lib/models/Cart'

interface VerifyPaymentRequest {
  orderId: string
  checkoutSessionId: string
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
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
    const client = await clientPromise
    const db = client.db()
    const orderObjectId = new ObjectId(orderId)

    const order = await db.collection<Order>('orders').findOne({ _id: orderObjectId })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
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
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
