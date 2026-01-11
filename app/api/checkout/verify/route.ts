import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyPaymentSignature, getPaymentDetails } from '@/lib/razorpay'
import type { Order } from '@/lib/models/Order'
import type { Cart } from '@/lib/models/Cart'

interface VerifyPaymentRequest {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const body: VerifyPaymentRequest = await request.json()
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpayPaymentId)

    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      return NextResponse.json(
        { error: `Payment not successful. Status: ${paymentDetails.status}` },
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

    // Verify the Razorpay order ID matches
    if (order.payment?.razorpayOrderId !== razorpayOrderId) {
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
          'payment.razorpayPaymentId': razorpayPaymentId,
          'payment.razorpaySignature': razorpaySignature,
          'payment.paymentStatus': paymentDetails.status === 'captured' ? 'captured' : 'pending',
          status: paymentDetails.status === 'captured' ? 'processing' : 'pending',
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
      paymentStatus: paymentDetails.status,
    })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
