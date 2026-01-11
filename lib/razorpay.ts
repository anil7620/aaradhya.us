import Razorpay from 'razorpay'

// Initialize Razorpay instance
// Using dummy keys for now - user will provide real keys later
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id'
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_key_secret'

export const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
})

export interface RazorpayOrderOptions {
  amount: number // Amount in paise (smallest currency unit)
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(options: RazorpayOrderOptions) {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes || {},
    })
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const generatedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  
  return generatedSignature === signature
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment details:', error)
    throw error
  }
}

/**
 * Fetch order details from Razorpay
 */
export async function getOrderDetails(orderId: string) {
  try {
    const order = await razorpay.orders.fetch(orderId)
    return order
  } catch (error) {
    console.error('Error fetching order details:', error)
    throw error
  }
}
