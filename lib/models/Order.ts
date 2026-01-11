import { ObjectId } from 'mongodb'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: ObjectId
  quantity: number
  price: number
  selectedColor?: string
  selectedFragrance?: string
  category?: string // For tax calculation
  gstRate?: number // GST rate applied
  gstAmount?: number // GST amount for this item
}

export interface RazorpayPaymentDetails {
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  paymentStatus: 'pending' | 'captured' | 'failed' | 'refunded'
  amount: number // Amount in paise
  currency: string
}

export interface GuestOrderInfo {
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface Order {
  _id?: ObjectId
  customerId?: ObjectId // Optional for guest orders
  guestInfo?: GuestOrderInfo // For guest checkout
  items: OrderItem[]
  subtotal: number // Amount before tax
  gstAmount: number // Total GST amount
  totalAmount: number // Final amount including GST
  status: OrderStatus
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  payment?: RazorpayPaymentDetails
  createdAt: Date
  updatedAt: Date
}

