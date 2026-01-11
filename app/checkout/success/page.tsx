'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    // Try to fetch order details (works for both logged-in and guest)
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      // For guest orders, we'll show basic info from the orderId
      // In a real scenario, you might want to create an endpoint that accepts orderId + email
      setOrderDetails({ orderId })
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  #{orderId.slice(-8).toUpperCase()}
                </p>
              </div>
            )}
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              What's Next?
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                • You will receive an order confirmation email shortly with all the details.
              </p>
              <p>
                • We'll send you shipping updates as soon as your order is dispatched.
              </p>
              <p>
                • You can track your order status using the Order ID above.
              </p>
            </div>
          </div>

          {/* Guest User Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Guest Checkout
                </h3>
                <p className="text-sm text-blue-800">
                  Since you checked out as a guest, please save your Order ID for future reference.
                  You can use it to track your order or contact our support team.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="flex-1">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
