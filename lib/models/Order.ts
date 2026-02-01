import { ObjectId } from 'mongodb'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: ObjectId
  quantity: number
  price: number
  selectedColor?: string
  selectedFragrance?: string
  category?: string // For tax calculation
  taxRate?: number // Sales tax rate applied
  taxAmount?: number // Sales tax amount for this item
}

export interface StripePaymentDetails {
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  stripePaymentId?: string
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded'
  amount: number // Amount in cents (USD)
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
  taxAmount: number // Total sales tax amount
  totalAmount: number // Final amount including tax
  status: OrderStatus
  shippingAddressId?: ObjectId // Reference to saved address (nullable for guest orders)
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  shippingAddressSnapshot?: {
    // Complete address snapshot at order time
    label?: string
    type?: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    savedAt?: Date // When address was saved (if from saved address)
  }
  payment?: StripePaymentDetails
  createdAt: Date
  updatedAt: Date
}

