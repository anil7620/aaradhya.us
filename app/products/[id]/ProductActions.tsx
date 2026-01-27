'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'

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

  // Helper function to normalize selection values for comparison
  // Treats null, undefined, empty string, and missing property as equivalent
  const normalizeSelection = (value: string | null | undefined): string | null => {
    if (!value || value === '') return null
    return value
  }

  // Helper function to compare cart items by productId and selections
  const matchesCartItem = (item: any): boolean => {
    const itemColor = normalizeSelection(item.selectedColor)
    const itemFragrance = normalizeSelection(item.selectedFragrance)
    const currentColor = normalizeSelection(selectedColor)
    const currentFragrance = normalizeSelection(selectedFragrance)
    
    return item.productId === productId && 
           itemColor === currentColor && 
           itemFragrance === currentFragrance
  }

  const handleAddToCart = async () => {
    if (!isValid) {
      setMessage('Please select color and fragrance before adding to cart')
      return
    }

    setLoading('cart')
    setMessage('')

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        // Save to localStorage when not logged in
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
        const existingItemIndex = cartItems.findIndex(matchesCartItem)

        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += 1
        } else {
          // Only include selections if they have actual values (not null/empty)
          const newItem: any = { 
            productId, 
            quantity: 1, 
            price,
          }
          
          const normalizedColor = normalizeSelection(selectedColor)
          const normalizedFragrance = normalizeSelection(selectedFragrance)
          
          if (normalizedColor) newItem.selectedColor = normalizedColor
          if (normalizedFragrance) newItem.selectedFragrance = normalizedFragrance
          
          cartItems.push(newItem)
        }

        localStorage.setItem('cart', JSON.stringify(cartItems))
        setMessage('Added to cart! Please login to continue.')
        setLoading(null)
        setTimeout(() => {
          router.push('/login')
        }, 1500)
        return
      }

      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId, 
          quantity: 1,
          selectedColor: selectedColor || undefined,
          selectedFragrance: selectedFragrance || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Failed to add to cart')
        setLoading(null)
        return
      }

      setMessage('Added to cart!')
      setLoading(null)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Something went wrong')
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
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        // Guest checkout - add to localStorage and go to checkout
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
        const existingItemIndex = cartItems.findIndex(matchesCartItem)

        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += 1
        } else {
          // Only include selections if they have actual values (not null/empty)
          const newItem: any = { 
            productId, 
            quantity: 1, 
            price,
          }
          
          const normalizedColor = normalizeSelection(selectedColor)
          const normalizedFragrance = normalizeSelection(selectedFragrance)
          
          if (normalizedColor) newItem.selectedColor = normalizedColor
          if (normalizedFragrance) newItem.selectedFragrance = normalizedFragrance
          
          cartItems.push(newItem)
        }

        localStorage.setItem('cart', JSON.stringify(cartItems))
        // Redirect directly to checkout for guest users
        router.push('/checkout')
        return
      }

      // Logged-in user - add to cart first, then redirect to checkout
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId, 
          quantity: 1,
          selectedColor: selectedColor || undefined,
          selectedFragrance: selectedFragrance || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || 'Failed to add to cart')
        setLoading(null)
        return
      }

      // Redirect to checkout
      router.push('/checkout')
    } catch (err) {
      setMessage('Something went wrong')
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
    <div className="space-y-3 md:space-y-4">
      <div className="flex gap-3 md:gap-4">
        <button
          onClick={handleAddToCart}
          disabled={loading !== null || !isValid}
          className="flex-1 border-2 border-primary bg-transparent text-primary px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-primary hover:text-white hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
        >
          {loading === 'cart' ? 'Adding...' : 'ADD TO CART'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={loading !== null || !isValid}
          className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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

