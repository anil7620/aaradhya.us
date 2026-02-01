'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductImage from '@/app/components/ProductImage'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCart, updateCartItem, removeFromCart } from '@/lib/cart-client'

interface CartItem {
  productId: string
  quantity: number
  price: number
  product: {
    _id: string
    name: string
    images: string[]
    stock: number
  } | null
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const data = await getCart()
      setCartItems(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Error fetching cart:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    setUpdating(productId)
    try {
      await updateCartItem(productId, newQuantity)
      await fetchCart()
    } catch (err) {
      console.error('Error updating cart:', err)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    setUpdating(productId)
    try {
      await removeFromCart(productId)
      await fetchCart()
    } catch (err) {
      console.error('Error removing item:', err)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6 md:mb-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 md:mb-10">Add some products to get started!</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-8 lg:py-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-8 lg:mb-12 leading-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:space-y-6">
            {cartItems.map((item) => {
              if (!item.product) return null

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8"
                >
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-lg overflow-hidden border border-gray-200">
                        <ProductImage
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link href={`/products/${item.productId}`} className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                            {item.product.name}
                          </h3>
                        </Link>
                        {/* Subtotal - Mobile */}
                        <div className="text-right sm:hidden">
                          <p className="text-base font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-base md:text-lg font-bold text-primary mb-3 md:mb-4">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-1 md:gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                            }}
                            disabled={updating === item.productId || item.quantity <= 1}
                            className="p-1.5 md:p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          <span className="px-3 md:px-4 py-1.5 md:py-2 min-w-[2.5rem] md:min-w-[3rem] text-center font-medium text-sm md:text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.product && item.quantity < item.product.stock) {
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                            }}
                            disabled={
                              updating === item.productId ||
                              (item.product && item.quantity >= item.product.stock)
                            }
                            className="p-1.5 md:p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={updating === item.productId}
                          className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>

                      {item.product && item.quantity >= item.product.stock && (
                        <p className="text-xs text-red-600 mt-2">
                          Maximum stock available: {item.product.stock}
                        </p>
                      )}
                    </div>

                    {/* Subtotal - Desktop */}
                    <div className="hidden sm:block text-right">
                      <p className="text-base md:text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8 sticky top-4">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6 lg:mb-8">Order Summary</h2>

              <div className="space-y-3 md:space-y-4 lg:space-y-6 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base">
                <div className="flex justify-between text-gray-600">
                  <span className="text-xs md:text-sm">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="text-xs md:text-sm">Shipping</span>
                  <span className="text-xs md:text-sm">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-3 md:pt-4">
                  <div className="flex justify-between text-lg md:text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full mb-3 md:mb-4 text-sm md:text-base py-2.5 md:py-3"
                onClick={() => {
                  router.push('/checkout')
                }}
              >
                Proceed to Checkout
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full text-sm md:text-base py-2.5 md:py-3">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

