'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Tag,
  Palette,
  DownloadCloud,
  UploadCloud,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  createdAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#f472b6',
    icon: 'Tag',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#f472b6',
    icon: 'Tag',
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch categories')
      setCategories(data.categories || [])
      setFilteredCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
      setCurrentPage(1)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        category.icon?.toLowerCase().includes(query)
    )
    setFilteredCategories(filtered)
    setCurrentPage(1)
  }, [searchQuery, categories])

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create category')

      setForm({
        name: '',
        slug: '',
        description: '',
        color: '#f472b6',
        icon: 'Tag',
      })
      setMessage('Category created successfully')
      setShowAddForm(false)
      fetchCategories()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/categories/export')
      if (!res.ok) {
        throw new Error('Failed to export categories')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'categories-export.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setMessage('Categories exported successfully')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to export categories')
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setMessage(null)
    try {
      const text = await file.text()
      const res = await fetch('/api/admin/categories/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import categories')
      }
      setMessage(`Imported ${data.imported} categories successfully`)
      await fetchCategories()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to import categories')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#f472b6',
      icon: category.icon || 'Tag',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({
      name: '',
      slug: '',
      description: '',
      color: '#f472b6',
      icon: 'Tag',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...editForm,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update category')

      setMessage('Category updated successfully')
      setEditingId(null)
      await fetchCategories()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete category')

      setMessage('Category deleted successfully')
      await fetchCategories()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-sage flex items-center justify-center text-white">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Categories</h1>
                  <p className="text-xs text-gray-500">
                    {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* Import/Export */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="h-9 text-xs"
                >
                  <DownloadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Export
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="h-9 text-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  {importing ? 'Importing...' : 'Import'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleImportFile}
                />

                {/* Add Category */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="h-9 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Category
                </Button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Add Category Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-xs">
                      Slug
                    </Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                      required
                      placeholder="e.g. puja"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-xs">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short blurb shown to admins"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="color" className="text-xs flex items-center gap-1">
                      Accent color <Palette className="w-3 h-3 text-primary" />
                    </Label>
                    <Input
                      id="color"
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                      className="mt-1 h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon" className="text-xs">
                      Icon name (optional)
                    </Label>
                    <Input
                      id="icon"
                      value={form.icon}
                      onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                      placeholder="Tag"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={saving} className="h-8 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    {saving ? 'Creating...' : 'Add Category'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false)
                      setForm({
                        name: '',
                        slug: '',
                        description: '',
                        color: '#f472b6',
                        icon: 'Tag',
                      })
                    }}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

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
                          Category
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedCategories.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                            {searchQuery ? 'No categories found matching your search' : 'No categories found'}
                          </td>
                        </tr>
                      ) : (
                        paginatedCategories.map((category) => (
                          <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                            {editingId === category.id ? (
                              // Edit Mode Row
                              <>
                                <td className="px-4 py-2.5">
                                  <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="h-8 text-sm"
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <Input
                                    value={editForm.slug}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                                    }
                                    required
                                    className="h-8 text-sm"
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <Input
                                    value={editForm.description}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    className="h-8 text-sm"
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <Input
                                    type="color"
                                    value={editForm.color}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, color: e.target.value }))}
                                    className="h-8 w-16"
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-xs text-gray-500">{formatDate(category.createdAt)}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={handleSaveEdit}
                                      disabled={saving}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelEdit}
                                      disabled={saving}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              // View Mode Row
                              <>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                      style={{ backgroundColor: category.color || '#ec4899' }}
                                    >
                                      <Tag className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-sm text-gray-600">/{category.slug}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-sm text-gray-600">
                                    {category.description || '-'}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div
                                    className="w-6 h-6 rounded border border-gray-300"
                                    style={{ backgroundColor: category.color || '#ec4899' }}
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-xs text-gray-500">{formatDate(category.createdAt)}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStartEdit(category)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(category.id)}
                                      disabled={deletingId === category.id}
                                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of{' '}
                      {filteredCategories.length} categories
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
