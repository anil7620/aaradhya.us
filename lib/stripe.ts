import Stripe from 'stripe'
import { logger } from './logger'

// Initialize Stripe instance (lazy initialization to avoid build-time errors)
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
  }
  return stripeInstance
}

// Note: Use getStripe() function instead of direct stripe export to avoid build-time initialization

export interface StripePaymentIntentOptions {
  amount: number // Amount in cents (USD)
  currency: string
  metadata?: Record<string, string>
}

export interface StripeCheckoutSessionOptions {
  amount: number // Amount in cents
  currency: string
  orderId: string
  customerEmail?: string
  customerName?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

/**
 * Create a Stripe Payment Intent
 */
export async function createPaymentIntent(options: StripePaymentIntentOptions) {
  try {
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency || 'usd',
      metadata: options.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return paymentIntent
  } catch (error) {
    logger.error('Error creating Stripe payment intent:', error)
    throw error
  }
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(options: StripeCheckoutSessionOptions) {
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: options.currency || 'usd',
            product_data: {
              name: 'Aaradhya Order',
              description: `Order #${options.orderId}`,
            },
            unit_amount: options.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      metadata: {
        orderId: options.orderId,
        ...options.metadata,
      },
    })
    return session
  } catch (error) {
    logger.error('Error creating Stripe checkout session:', error)
    throw error
  }
}

/**
 * Retrieve a Stripe Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    logger.error('Error retrieving payment intent:', error)
    throw error
  }
}

/**
 * Retrieve a Stripe Checkout Session
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    logger.error('Error retrieving checkout session:', error)
    throw error
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
