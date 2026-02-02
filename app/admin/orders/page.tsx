'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Truck, PackageCheck, Clock3, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
type OrderStatusFilter = OrderStatus | 'all'

interface AdminOrder {
  id: string
  customerId: string | null
  guestInfo: {
    email: string
    firstName: string
    lastName: string
    phoneNumber?: string
  } | null
  totalAmount: number
  subtotal: number
  taxAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  items: {
    productId: string
    quantity: number
    price: number
    selectedColor?: string
    selectedFragrance?: string
  }[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  payment?: {
    paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded'
    amount: number
    currency: string
  } | null
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

const ITEMS_PER_PAGE = 10

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders')
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

  // Filter orders based on search query and status
  useEffect(() => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.customerId?.toLowerCase().includes(query) ||
          order.guestInfo?.email.toLowerCase().includes(query) ||
          order.guestInfo?.firstName.toLowerCase().includes(query) ||
          order.guestInfo?.lastName.toLowerCase().includes(query) ||
          order.shippingAddress.city.toLowerCase().includes(query) ||
          order.shippingAddress.state.toLowerCase().includes(query) ||
          order.shippingAddress.zipCode.includes(query)
      )
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, orders])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCustomerName = (order: AdminOrder) => {
    if (order.guestInfo) {
      return `${order.guestInfo.firstName} ${order.guestInfo.lastName}`
    }
    return `Customer #${order.customerId?.slice(-6).toUpperCase() || 'N/A'}`
  }

  const getCustomerEmail = (order: AdminOrder) => {
    if (order.guestInfo) {
      return order.guestInfo.email
    }
    return 'Registered User'
  }

  const getTotalItems = (order: AdminOrder) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center text-white">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">All Orders</h1>
                  <p className="text-xs text-gray-500">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatusFilter)}
                  className="h-9 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                            {searchQuery || statusFilter !== 'all'
                              ? 'No orders found matching your filters'
                              : 'No orders found'}
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => {
                          const status = statusConfig[order.status]
                          const StatusIcon = status.icon
                          const totalItems = getTotalItems(order)

                          return (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-2.5">
                                <span className="text-sm font-mono text-gray-900">
                                  #{order.id.slice(-8).toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{getCustomerName(order)}</p>
                                  <p className="text-xs text-gray-500">{getCustomerEmail(order)}</p>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-sm text-gray-600">
                                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                                <p className="text-xs text-gray-500">
                                  Subtotal: {formatCurrency(order.subtotal)}
                                </p>
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                {order.payment ? (
                                  <div>
                                    <span
                                      className={`text-xs font-medium ${
                                        order.payment.paymentStatus === 'succeeded'
                                          ? 'text-emerald-600'
                                          : order.payment.paymentStatus === 'failed'
                                          ? 'text-red-600'
                                          : order.payment.paymentStatus === 'refunded'
                                          ? 'text-amber-600'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {order.payment.paymentStatus.charAt(0).toUpperCase() +
                                        order.payment.paymentStatus.slice(1)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{' '}
                      {filteredOrders.length} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-3 text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </Button>
                      <div className="text-xs text-gray-600 px-2">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 text-xs"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
