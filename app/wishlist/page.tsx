'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import ProductImage from '@/app/components/ProductImage'
import { Button } from '@/components/ui/button'
import { getWishlist, removeFromWishlist } from '@/lib/wishlist-client'
import { addToCart } from '@/lib/cart-client'

interface WishlistProduct {
  _id: string
  name: string
  price: number
  mrp?: number
  images: string[]
  stock: number
  isActive: boolean
}

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    setRemoving(productId)
    try {
      await removeFromWishlist(productId)
      setProducts(products.filter(p => p._id !== productId))
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      console.error('Error removing from wishlist:', err)
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId)
    try {
      await addToCart(productId, 1)
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingToCart(null)
    }
  }

  const discountPercent = (product: WishlistProduct) => {
    if (product.mrp && product.mrp > product.price) {
      return Math.round(((product.mrp - product.price) / product.mrp) * 100)
    }
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 md:py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-3 md:mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Start adding products you love to your wishlist!
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => {
              const discount = discountPercent(product)
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/products/${product._id}`} className="block">
                    <div className="relative aspect-square bg-gray-100">
                      <ProductImage
                        src={product.images?.[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {discount}% OFF
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-base font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                        {product.mrp && product.mrp > product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            ${product.mrp.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleRemove(product._id)}
                        disabled={removing === product._id}
                      >
                        {removing === product._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleAddToCart(product._id)}
                        disabled={addingToCart === product._id || product.stock === 0}
                      >
                        {addingToCart === product._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
