'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProductImage from './ProductImage'
import { ShoppingCart, Heart, Check } from 'lucide-react'
import { addToCart as addToCartAPI } from '@/lib/cart-client'

interface ProductCardProps {
  product: {
    _id?: string
    name: string
    price: number
    mrp?: number
    images?: string[]
    isFeatured?: boolean
    stock?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  const discountPercent = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0

  const handleCardClick = () => {
    router.push(`/products/${product._id}`)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setAddingToCart(true)

    try {
      await addToCartAPI(product._id?.toString() || '', 1)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      alert(error.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      router.push('/login')
      return
    }

    setTogglingWishlist(true)

    try {
      // TODO: Implement wishlist API when available
      // For now, just toggle local state and redirect to login if not authenticated
      setIsInWishlist(!isInWishlist)
      
      // When wishlist API is implemented, use this:
      // if (isInWishlist) {
      //   await fetch(`/api/wishlist/${product._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      // } else {
      //   await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: product._id }) })
      // }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setTogglingWishlist(false)
    }
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container - Fixed height h-64 (256px) */}
      <div className="relative h-64 bg-gradient-to-br from-sage/10 to-sage/20 overflow-hidden">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
        
        {/* Wishlist Button - top-3 right-3, p-2 */}
        <button
          onClick={handleWishlistToggle}
          disabled={togglingWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart 
            className={`h-5 w-5 transition-all duration-200 ${
              isInWishlist 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>
        
        {/* Featured Badge - Top Left */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10">
            Featured
          </div>
        )}
      </div>
      
      {/* Product Info - Padding: p-4 mobile, lg:p-5 desktop */}
      <div className="p-4 lg:p-5">
        {/* Title - text-[14px] mobile, lg:text-[16px] desktop */}
        <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900 group-hover:text-teal-500 transition-colors leading-tight text-[14px] lg:text-[16px]">
          {product.name}
        </h3>
        
        {/* Price and Add button in same row */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0 flex-1">
            <span className="text-sm lg:text-base font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  ${product.mrp.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="flex-shrink-0 bg-primary text-white px-3 lg:px-4 py-1.5 rounded-lg font-medium text-sm lg:text-base hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>{addingToCart ? 'Adding...' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
