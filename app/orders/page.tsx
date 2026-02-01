'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderItem {
  productId: string
  quantity: number
  price: number
  selectedColor?: string
  selectedFragrance?: string
}

interface Order {
  id: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check for success message in URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      const orderId = params.get('orderId')
      if (orderId) {
        setSuccessMessage(`Order placed successfully! Order ID: ${orderId.slice(-8).toUpperCase()}`)
      } else {
        setSuccessMessage('Order placed successfully!')
      }
      // Clean up URL
      window.history.replaceState({}, '', '/orders')
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch orders')
        }

        setOrders(data.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-4 md:py-8 lg:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-4 md:mb-6 lg:mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 border border-white/60">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-primary to-sage flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm uppercase tracking-wider text-gray-500">
                    Your orders
                  </p>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                    Order History
                  </h1>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">
                    Track deliveries, review items, and manage your purchases.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {successMessage && (
            <motion.div
              variants={itemVariants}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-2xl bg-white/60 animate-pulse"
                />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6"
            >
              {error}
            </motion.div>
          ) : orders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-10 text-center border border-dashed border-gray-200"
            >
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">
                No orders yet
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                When you place an order, it will appear here with tracking
                details and delivery updates.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-2 mt-6 text-sm font-semibold text-white bg-gradient-to-r from-primary to-sage rounded-full shadow-lg shadow-primary/30 hover:opacity-95 transition"
              >
                Browse products
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="space-y-6"
            >
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-white/60 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-gray-500">Order ID</p>
                          <p className="text-base md:text-lg font-semibold tracking-tight text-gray-900">
                            #{order.id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs md:text-sm text-gray-400">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <p className="text-lg md:text-2xl font-bold text-gray-900 flex-shrink-0">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold ${status.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-3 md:my-4" />

                    <div className="space-y-2 md:space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-${item.productId}-${idx}`}
                          className="flex items-center justify-between text-xs md:text-sm text-gray-600 bg-gray-50 rounded-xl px-3 md:px-4 py-2"
                        >
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-xl bg-white shadow flex items-center justify-center text-gray-400 text-[10px] md:text-xs font-semibold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">
                                Product #{item.productId.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-[10px] md:text-xs text-gray-400">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-xs md:text-sm flex-shrink-0 ml-2">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}


