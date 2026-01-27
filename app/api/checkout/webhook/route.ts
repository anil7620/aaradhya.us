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
    // Note: PaymentIntent metadata doesn't contain orderId (it's only in CheckoutSession metadata)
    // So we need to find the order by payment intent ID (stored after checkout.session.completed)
    // or by searching for pending orders that might match
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const stripe = getStripe()
      
      let orderId: string | null = null
      
      // Try to get orderId from PaymentIntent metadata (if we set it in the future)
      if (paymentIntent.metadata?.orderId) {
        orderId = paymentIntent.metadata.orderId
      } else {
        // Find order by payment intent ID (stored when checkout.session.completed fires)
        const orderByPaymentId = await db.collection<Order>('orders').findOne({
          'payment.stripePaymentId': paymentIntent.id,
        })
        
        if (orderByPaymentId) {
          orderId = orderByPaymentId._id?.toString() || null
        } else {
          // If checkout.session.completed hasn't fired yet, try to find by checkout session
          // We can list checkout sessions and find one with this payment intent
          // But this is expensive, so we'll just log and let checkout.session.completed handle it
          console.log(`PaymentIntent ${paymentIntent.id} succeeded, but no matching order found. Waiting for checkout.session.completed event.`)
          // Return early - checkout.session.completed will handle the order update
          return NextResponse.json({ received: true })
        }
      }

      if (orderId) {
        const orderObjectId = new ObjectId(orderId)
        const existingOrder = await db.collection<Order>('orders').findOne({ _id: orderObjectId })
        
        // Only update if order exists and payment status is still pending
        // This prevents overwriting updates from checkout.session.completed
        // Also acts as a fallback if checkout.session.completed was missed
        if (existingOrder) {
          const currentPaymentStatus = existingOrder.payment?.paymentStatus
          if (currentPaymentStatus === 'pending' || !currentPaymentStatus) {
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
            console.log(`Order ${orderId} updated from payment_intent.succeeded event (fallback handler)`)
          }
        }
      }
    }

    // Handle payment_intent.payment_failed event
    // Note: PaymentIntent metadata doesn't contain orderId, so we find the order by payment intent ID
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      let orderId: string | null = null
      
      // Try to get orderId from PaymentIntent metadata (if we set it in the future)
      if (paymentIntent.metadata?.orderId) {
        orderId = paymentIntent.metadata.orderId
      } else {
        // Find order by payment intent ID stored in the order
        const order = await db.collection<Order>('orders').findOne({
          'payment.stripePaymentId': paymentIntent.id,
        })
        
        if (order) {
          orderId = order._id?.toString() || null
        } else {
          console.log(`PaymentIntent ${paymentIntent.id} failed, but no matching order found`)
        }
      }

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
        console.log(`Order ${orderId} marked as cancelled - payment failed`)
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
