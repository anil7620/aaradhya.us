'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package,
  Layers,
  Check,
  X,
  DownloadCloud,
  UploadCloud,
  Filter,
  Search,
  Pencil,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdminProduct {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  isActive: boolean
  createdAt: string
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch products')
        setProducts(data.products || [])
        const uniqueCategories = Array.from(
          new Set((data.products || []).map((product: AdminProduct) => product.category))
        )
        setCategories(uniqueCategories as string[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/products/export')
      if (!res.ok) throw new Error('Failed to export products')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'products-export.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to export products')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setNotice(null)
    try {
      const text = await file.text()
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to import products')
      setNotice(`Imported ${data.imported} products successfully`)
      const refresh = await fetch('/api/admin/products')
      const refreshData = await refresh.json()
      if (refresh.ok) {
        setProducts(refreshData.products || [])
        const uniqueCategories = Array.from(
          new Set((refreshData.products || []).map((product: AdminProduct) => product.category))
        )
        setCategories(uniqueCategories as string[])
      }
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : 'Failed to import products'
      )
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in' && product.stock > 0) ||
        (stockFilter === 'out' && product.stock <= 0) ||
        (stockFilter === 'low' && product.stock > 0 && product.stock <= 5)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive)
      return matchesSearch && matchesCategory && matchesStock && matchesStatus
    })
  }, [products, search, categoryFilter, stockFilter, statusFilter])

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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Catalog control
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  All Products
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Review stock levels, categories, and pricing at a glance.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-6 bg-white rounded-2xl shadow-lg border border-white/70 p-4 md:p-5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="w-4 h-4" />
                Quick filters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border-gray-200 text-sm px-3 py-2"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="rounded-xl border-gray-200 text-sm px-3 py-2"
                >
                  <option value="all">All stock</option>
                  <option value="in">In stock</option>
                  <option value="low">Low (≤5)</option>
                  <option value="out">Out of stock</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
                  }
                  className="rounded-xl border-gray-200 text-sm px-3 py-2"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Bulk product import / export
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Manage large catalogs with CSV files. Reference template at{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">
                    samples/sample-products.csv
                  </code>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => router.push('/admin/products/new')}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="inline-flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  {importing ? 'Importing…' : 'Import CSV'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </div>
            {notice && (
              <div className="mt-3 text-sm text-primary">{notice}</div>
            )}
          </motion.div>

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-24 bg-white/60 rounded-2xl animate-pulse" />
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
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg border border-white/70 overflow-hidden"
            >
              <div className="hidden md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Stock</th>
                      <th className="px-6 py-3 text-right">Price</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/60">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {product.description}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-semibold">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              product.isActive
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {product.isActive ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                Hidden
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary font-semibold"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="p-10 text-center text-gray-500 text-sm">
                    No products match your filters.
                  </div>
                )}
              </div>
              <div className="md:hidden divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {product.category} • Stock {product.stock}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          product.isActive
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatCurrency(product.price)}</span>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1 text-primary font-semibold"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No products match your filters.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}


