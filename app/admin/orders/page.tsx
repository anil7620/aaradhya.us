'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Truck, PackageCheck, Clock3, XCircle } from 'lucide-react'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface AdminOrder {
  id: string
  customerId: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  items: {
    productId: string
    quantity: number
    price: number
  }[]
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock3 },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: PackageCheck },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: PackageCheck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders')
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
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-white/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center text-white shadow-lg">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Fulfilment overview
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  All Orders
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Monitor every order status, amount, and customer association.
                </p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-28 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon
                return (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-md p-5 border border-white/80 flex flex-col gap-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          Customer #{order.customerId.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-400">
                          Placed {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-${item.productId}-${idx}`}
                          className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold">Product #{item.productId.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
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


