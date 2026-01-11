'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Tag, Palette, DownloadCloud, UploadCloud, Edit2, Trash2, X, Check } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch categories')
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

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
      fetchCategories()
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
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Failed to export categories'
      )
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
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Failed to import categories'
      )
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
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-white/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sage flex items-center justify-center text-white shadow-lg">
                <Tag className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Curate catalog
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  Categories
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Add or edit categories to keep your storefront organized.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Bulk import / export
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use CSV files to migrate categories. Sample template lives in{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">
                    samples/sample-categories.csv
                  </code>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
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
                  onChange={handleImportFile}
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-white/60 p-6 md:p-8 mb-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                    required
                    placeholder="e.g. puja"
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-2"
                  placeholder="Short blurb shown to admins"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color" className="flex items-center gap-2">
                    Accent color <Palette className="w-4 h-4 text-primary" />
                  </Label>
                  <Input
                    id="color"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon name (optional)</Label>
                  <Input
                    id="icon"
                    value={form.icon}
                    onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                    className="mt-2"
                    placeholder="Any lucide icon name"
                  />
                </div>
              </div>
              {message && (
                <p className="text-sm text-primary">{message}</p>
              )}
              <Button type="submit" className="inline-flex items-center gap-2" disabled={saving}>
                <Plus className="w-4 h-4" />
                {saving ? 'Creating...' : 'Add Category'}
              </Button>
            </form>
          </motion.div>

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-20 bg-white/60 rounded-2xl animate-pulse" />
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
            <motion.div variants={containerVariants} className="space-y-3">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-md p-5 border border-white/80"
                >
                  {editingId === category.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-name-${category.id}`}>Name</Label>
                          <Input
                            id={`edit-name-${category.id}`}
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-slug-${category.id}`}>Slug</Label>
                          <Input
                            id={`edit-slug-${category.id}`}
                            value={editForm.slug}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                            required
                            placeholder="e.g. puja"
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                        <Input
                          id={`edit-description-${category.id}`}
                          value={editForm.description}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="mt-2"
                          placeholder="Short blurb shown to admins"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-color-${category.id}`} className="flex items-center gap-2">
                            Accent color <Palette className="w-4 h-4 text-primary" />
                          </Label>
                          <Input
                            id={`edit-color-${category.id}`}
                            type="color"
                            value={editForm.color}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, color: e.target.value }))}
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-icon-${category.id}`}>Icon name (optional)</Label>
                          <Input
                            id={`edit-icon-${category.id}`}
                            value={editForm.icon}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, icon: e.target.value }))}
                            className="mt-2"
                            placeholder="Any lucide icon name"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner flex-shrink-0"
                          style={{ backgroundColor: category.color || '#ec4899' }}
                        >
                          <Tag className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-400">/{category.slug}</p>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(category)}
                          className="inline-flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === category.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}


