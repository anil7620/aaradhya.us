import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyWebhookSignature, getStripe } from '@/lib/stripe'
import type { Order } from '@/lib/models/Order'
import Stripe from 'stripe'

// Get webhook secret (lazy to avoid build-time errors)
function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required')
  }
  return secret
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')
    const body = await request.text()

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, getWebhookSecret())
    } catch (error: any) {
      console.error('Invalid webhook signature:', error.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        const orderObjectId = new ObjectId(orderId)
        const order = await db.collection<Order>('orders').findOne({ _id: orderObjectId })

        if (order) {
          // Verify payment actually succeeded before marking as processing
          if (session.payment_status === 'paid') {
            await db.collection<Order>('orders').updateOne(
              { _id: orderObjectId },
              {
                $set: {
                  'payment.stripePaymentId': session.payment_intent as string,
                  'payment.stripeCheckoutSessionId': session.id,
                  'payment.paymentStatus': 'succeeded',
                  status: 'processing',
                  updatedAt: new Date(),
                },
              }
            )
            console.log(`Order ${orderId} marked as processing - payment succeeded`)
          } else if (session.payment_status === 'unpaid') {
            // Payment failed or was not completed
            await db.collection<Order>('orders').updateOne(
              { _id: orderObjectId },
              {
                $set: {
                  'payment.stripeCheckoutSessionId': session.id,
                  'payment.paymentStatus': 'failed',
                  status: 'cancelled',
                  updatedAt: new Date(),
                },
              }
            )
            console.log(`Order ${orderId} marked as cancelled - payment unpaid`)
          } else {
            // Handle other payment statuses (e.g., 'no_payment_required')
            console.log(`Order ${orderId} checkout completed with payment_status: ${session.payment_status}`)
          }
        }
      }
    }

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        const orderObjectId = new ObjectId(orderId)
        await db.collection<Order>('orders').updateOne(
          { _id: orderObjectId },
          {
            $set: {
              'payment.stripePaymentId': paymentIntent.id,
              'payment.paymentStatus': 'succeeded',
              status: 'processing',
              updatedAt: new Date(),
            },
          }
        )
      }
    }

    // Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

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

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
