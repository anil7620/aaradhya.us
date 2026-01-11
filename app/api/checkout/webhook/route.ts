import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyPaymentSignature } from '@/lib/razorpay'
import type { Order } from '@/lib/models/Order'
import crypto from 'crypto'

// Razorpay webhook secret (should be set in environment variables)
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret'

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  return expectedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-Razorpay-Signature')
    const body = await request.text()

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    console.log('Razorpay webhook received:', eventType, payload)

    const client = await clientPromise
    const db = client.db()

    // Handle payment.captured event
    if (eventType === 'payment.captured') {
      const payment = payload.payment.entity
      const orderId = payment.notes?.order_id

      if (orderId) {
        const orderObjectId = new ObjectId(orderId)
        const order = await db.collection<Order>('orders').findOne({ _id: orderObjectId })

        if (order) {
          await db.collection<Order>('orders').updateOne(
            { _id: orderObjectId },
            {
              $set: {
                'payment.razorpayPaymentId': payment.id,
                'payment.paymentStatus': 'captured',
                status: 'processing',
                updatedAt: new Date(),
              },
            }
          )
        }
      }
    }

    // Handle payment.failed event
    if (eventType === 'payment.failed') {
      const payment = payload.payment.entity
      const orderId = payment.notes?.order_id

      if (orderId) {
        const orderObjectId = new ObjectId(orderId)
        await db.collection<Order>('orders').updateOne(
          { _id: orderObjectId },
          {
            $set: {
              'payment.paymentStatus': 'failed',
              status: 'cancelled',
              updatedAt: new Date(),
            },
          }
        )
      }
    }

    // Handle order.paid event
    if (eventType === 'order.paid') {
      const order = payload.order.entity
      const orderId = order.notes?.order_id

      if (orderId) {
        const orderObjectId = new ObjectId(orderId)
        await db.collection<Order>('orders').updateOne(
          { _id: orderObjectId },
          {
            $set: {
              'payment.paymentStatus': 'captured',
              status: 'processing',
              updatedAt: new Date(),
            },
          }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
