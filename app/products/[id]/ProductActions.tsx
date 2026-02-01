'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { addToCart as addToCartAPI } from '@/lib/cart-client'

interface ProductActionsProps {
  productId: string
  stock: number
  price: number
  selectedColor?: string | null
  selectedFragrance?: string
  isValid?: boolean
}

export default function ProductActions({ 
  productId, 
  stock, 
  price,
  selectedColor,
  selectedFragrance,
  isValid = true,
}: ProductActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'cart' | 'buy' | null>(null)
  const [message, setMessage] = useState('')

  const handleAddToCart = async () => {
    if (!isValid) {
      setMessage('Please select color and fragrance before adding to cart')
      return
    }

    setLoading('cart')
    setMessage('')

    try {
      await addToCartAPI(
        productId,
        1,
        selectedColor || undefined,
        selectedFragrance || undefined
      )

      setMessage('Added to cart!')
      setLoading(null)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
      setLoading(null)
    }
  }

  const handleBuyNow = async () => {
    if (!isValid) {
      setMessage('Please select color and fragrance before proceeding')
      return
    }

    setLoading('buy')
    setMessage('')

    try {
      // Add to cart first (works for both authenticated and guest users)
      await addToCartAPI(
        productId,
        1,
        selectedColor || undefined,
        selectedFragrance || undefined
      )

      // Redirect to checkout
      router.push('/checkout')
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
      setLoading(null)
    }
  }

  if (stock === 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-semibold"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex gap-2 md:gap-3">
        <button
          onClick={handleAddToCart}
          disabled={loading !== null || !isValid}
          className="flex-1 border-2 border-primary bg-transparent text-primary px-4 py-2.5 md:px-5 md:py-3 rounded-lg font-semibold text-sm md:text-base shadow-sm hover:bg-primary hover:text-white hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
        >
          {loading === 'cart' ? 'Adding...' : 'ADD TO CART'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={loading !== null || !isValid}
          className="flex-1 bg-primary text-white px-4 py-2.5 md:px-5 md:py-3 rounded-lg font-semibold text-sm md:text-base shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'buy' ? 'Processing...' : 'BUY NOW'}
        </button>
      </div>
      {message && (
        <p className={`text-sm text-center font-medium ${message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

