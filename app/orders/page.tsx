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
  Filter,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
type OrderStatusFilter = OrderStatus | 'all'

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')
  const [showFilters, setShowFilters] = useState(false)

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
        setFilteredOrders(data.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...orders]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= filterDate
      })
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, dateFilter])

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
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-3 md:py-4 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-3 md:mb-4">
            <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 border border-white/60">
              <div className="flex items-center justify-between gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-primary to-sage flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                      Order History
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-3 md:mb-4 border border-white/60"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Filter Orders</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatusFilter)}
                    className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 block">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                    className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
              {(statusFilter !== 'all' || dateFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all')
                    setDateFilter('all')
                  }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              variants={itemVariants}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 md:p-4 mb-3 text-xs md:text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-24 rounded-xl bg-white/60 animate-pulse"
                />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 md:p-4 text-xs md:text-sm"
            >
              {error}
            </motion.div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center border border-dashed border-gray-200"
            >
              <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                {orders.length === 0 ? 'No orders yet' : 'No orders match filters'}
              </h2>
              <p className="text-gray-500 mt-2 text-xs md:text-sm max-w-md mx-auto">
                {orders.length === 0 
                  ? 'When you place an order, it will appear here with tracking details and delivery updates.'
                  : 'Try adjusting your filters to see more orders.'}
              </p>
              {orders.length === 0 && (
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-4 py-2 mt-4 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-primary to-sage rounded-full shadow-lg shadow-primary/30 hover:opacity-95 transition"
                >
                  Browse products
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="space-y-3 md:space-y-4"
            >
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-lg p-3 md:p-4 border border-white/60 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col gap-2 md:gap-3 mb-2 md:mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold tracking-tight text-gray-900">
                              #{order.id?.slice(-8).toUpperCase()}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <p className="text-base md:text-lg font-bold text-gray-900 flex-shrink-0">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-2 md:my-3" />

                    <div className="space-y-1.5 md:space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-${item.productId}-${idx}`}
                          className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-2 md:px-3 py-1.5"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-white shadow flex items-center justify-center text-gray-400 text-[9px] font-semibold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate text-xs">
                                Product #{item.productId.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-[9px] text-gray-400">
                                Qty: {item.quantity} × {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-xs flex-shrink-0 ml-2">
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


