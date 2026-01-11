'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, Tag, Upload, X, ArrowUp, ArrowDown, Edit2, Link as LinkIcon, Star } from 'lucide-react'
import Image from 'next/image'

// Image Preview Component with enhanced management
function ImagePreview({ 
  image, 
  index, 
  isPrimary,
  totalImages,
  onRemove,
  onMoveUp,
  onMoveDown,
  onReplace,
  onEditUrl
}: { 
  image: string
  index: number
  isPrimary: boolean
  totalImages: number
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onReplace?: () => void
  onEditUrl?: (newUrl: string) => void
}) {
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUrl, setEditedUrl] = useState(image)

  const handleSaveUrl = () => {
    if (onEditUrl && editedUrl.trim() && editedUrl !== image) {
      onEditUrl(editedUrl.trim())
      setImageError(false)
    }
    setIsEditing(false)
  }

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 hover:border-primary transition-colors">
      {/* Primary Image Badge */}
      {isPrimary && (
        <div className="absolute top-2 left-2 z-20 bg-primary text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
          <Star className="w-3 h-3 fill-current" />
          Primary
        </div>
      )}

      {/* Image Number Badge */}
      <div className="absolute top-2 right-2 z-20 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium">
        #{index + 1}
      </div>

      {image && image.trim() && !imageError ? (
        <Image
          src={image}
          alt={`Preview ${index + 1}`}
          fill
          className="object-cover"
          onError={() => {
            console.error('Failed to load image:', image)
            setImageError(true)
          }}
          unoptimized={image.startsWith('http')}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2">
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Image not available</p>
            {image && (
              <p className="text-[10px] mt-1 break-all text-gray-500 max-w-full overflow-hidden px-2">
                {image.length > 40 ? `${image.substring(0, 40)}...` : image}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Show on Hover */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-30">
        <div className="flex gap-2">
          {/* Move Up */}
          {onMoveUp && index > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-colors"
              title="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}

          {/* Move Down */}
          {onMoveDown && index < totalImages - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-colors"
              title="Move down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Replace Image */}
          {onReplace && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onReplace()
              }}
              className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-colors"
              title="Replace image"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}

          {/* Edit URL */}
          {onEditUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-colors"
              title="Edit URL"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Remove */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit URL Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/90 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="font-medium mb-2 text-sm">Edit Image URL</h3>
            <input
              type="text"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              placeholder="Enter image URL"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveUrl()
                }
                if (e.key === 'Escape') {
                  setIsEditing(false)
                  setEditedUrl(image)
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveUrl}
                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditedUrl(image)
                }}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProductForm {
  name: string
  description: string
  price: string
  mrp: string
  category: string
  stock: string
  images: string[]
  colors: Array<{ name: string; hex?: string }>
  fragrances: string[]
  isActive: boolean
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

export default function AdminNewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: '',
    stock: '0',
    images: [],
    colors: [],
    fragrances: [],
    isActive: true,
  })
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('')
  const [fragranceInput, setFragranceInput] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCategories((data.categories || []).map((category: any) => category.slug || category.name))
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (field: keyof ProductForm, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/products/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload images',
      })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }


  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return
    setForm((prev) => {
      const newImages = [...prev.images]
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
      return { ...prev, images: newImages }
    })
  }

  const handleMoveImageDown = (index: number) => {
    if (index === form.images.length - 1) return
    setForm((prev) => {
      const newImages = [...prev.images]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      return { ...prev, images: newImages }
    })
  }

  const handleReplaceImage = async (index: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/products/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()
        setForm((prev) => {
          const newImages = [...prev.images]
          newImages[index] = data.url
          return { ...prev, images: newImages }
        })
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Failed to replace image',
        })
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }

  const handleEditImageUrl = (index: number, newUrl: string): void => {
    setForm((prev) => {
      const newImages = [...prev.images]
      newImages[index] = newUrl
      return { ...prev, images: newImages }
    })
  }

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim()
    if (trimmed && !form.images.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, trimmed],
      }))
      setImageUrlInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          mrp: form.mrp ? parseFloat(form.mrp) : undefined,
          category: form.category || 'uncategorized',
          stock: parseInt(form.stock || '0', 10),
          images: form.images,
          colors: form.colors.length > 0 ? form.colors : undefined,
          fragrances: form.fragrances.length > 0 ? form.fragrances : undefined,
          isActive: form.isActive,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product')
      }

      setMessage({ type: 'success', text: 'Product created successfully' })
      router.push('/admin/products')
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create product',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-white/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <Tag className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Create product
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  New Product
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Add a single product with descriptions, pricing, and stock levels.
                </p>
              </div>
            </div>
          </motion.div>

          {message && (
            <motion.div
              variants={itemVariants}
              className={`rounded-2xl p-4 mb-6 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-white/60 p-6 md:p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mrp">MRP (Maximum Retail Price) - Optional</Label>
              <Input
                id="mrp"
                type="number"
                min="0"
                step="0.01"
                value={form.mrp}
                onChange={(e) => handleChange('mrp', e.target.value)}
                className="mt-2"
                placeholder="Leave empty if no discount"
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, discount percentage will be calculated automatically
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Short product story, ingredients, care instructions, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="mt-2 w-full rounded-xl border-gray-200 px-3 py-2"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  Status
                  {form.isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </Label>
                <select
                  className="mt-2 w-full rounded-xl border-gray-200 px-3 py-2"
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Hidden</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div>
              <Label>Available Colors (Optional)</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Add color options for this product. Customers can select colors when purchasing.
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Color name (e.g., Red, Blue)"
                  className="flex-1"
                />
                <Input
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="Hex code (e.g., #FF0000) - Optional"
                  className="w-32"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (colorName.trim()) {
                      setForm((prev) => ({
                        ...prev,
                        colors: [
                          ...prev.colors,
                          { name: colorName.trim(), hex: colorHex.trim() || undefined },
                        ],
                      }))
                      setColorName('')
                      setColorHex('')
                    }
                  }}
                  variant="outline"
                >
                  Add Color
                </Button>
              </div>
              {form.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300"
                      style={color.hex ? { backgroundColor: color.hex, borderColor: color.hex } : {}}
                    >
                      <span className="text-sm font-medium">{color.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            colors: prev.colors.filter((_, i) => i !== index),
                          }))
                        }}
                        className="ml-1 text-gray-600 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fragrances */}
            <div>
              <Label>Available Fragrances (Optional)</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Add fragrance options for this product. Customers can select fragrances when purchasing.
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={fragranceInput}
                  onChange={(e) => setFragranceInput(e.target.value)}
                  placeholder="Fragrance name (e.g., Lavender, Rose)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (fragranceInput.trim()) {
                        setForm((prev) => ({
                          ...prev,
                          fragrances: [...prev.fragrances, fragranceInput.trim()],
                        }))
                        setFragranceInput('')
                      }
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (fragranceInput.trim()) {
                      setForm((prev) => ({
                        ...prev,
                        fragrances: [...prev.fragrances, fragranceInput.trim()],
                      }))
                      setFragranceInput('')
                    }
                  }}
                  variant="outline"
                >
                  Add Fragrance
                </Button>
              </div>
              {form.fragrances.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.fragrances.map((fragrance, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-gray-50"
                    >
                      <span className="text-sm font-medium">{fragrance}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            fragrances: prev.fragrances.filter((_, i) => i !== index),
                          }))
                        }}
                        className="ml-1 text-gray-600 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Product Images</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Upload image files or add image URLs. The first image will be used as the primary image. Drag to reorder or use arrow buttons.
              </p>

              {/* File Upload */}
              <div className="mb-4">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add Image URL */}
              <div className="flex gap-2 mb-4">
                <Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Enter image URL (https://example.com/image.jpg)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddImageUrl}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!imageUrlInput.trim()}
                >
                  <LinkIcon className="w-4 h-4" />
                  Add URL
                </Button>
              </div>

              {/* Image Previews */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((image, index) => (
                    <ImagePreview
                      key={index}
                      image={image}
                      index={index}
                      isPrimary={index === 0}
                      totalImages={form.images.length}
                      onRemove={() => handleRemoveImage(index)}
                      onMoveUp={index > 0 ? () => handleMoveImageUp(index) : undefined}
                      onMoveDown={index < form.images.length - 1 ? () => handleMoveImageDown(index) : undefined}
                      onReplace={() => handleReplaceImage(index)}
                      onEditUrl={(newUrl: string) => handleEditImageUrl(index, newUrl)}
                    />
                  ))}
                </div>
              )}
            </div>

          <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/products')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}


