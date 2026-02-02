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
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-8 md:py-12 lg:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4 md:mb-6" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">Add some products to get started!</p>
            <Link href="/products">
              <Button className="text-sm py-2 md:py-2.5 px-6">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 md:py-4 lg:py-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4 lg:mb-6 leading-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2 md:space-y-3">
            {cartItems.map((item) => {
              if (!item.product) return null

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4"
                >
                  <div className="flex gap-3 md:gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <ProductImage
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link href={`/products/${item.productId}`} className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm md:text-base font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </p>
                        </Link>
                        {/* Subtotal - Mobile */}
                        <div className="text-right sm:hidden flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls and Actions */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                              }}
                              disabled={updating === item.productId || item.quantity <= 1}
                              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 py-1.5 min-w-[2.5rem] text-center font-medium text-sm border-x border-gray-300">
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
                              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            disabled={updating === item.productId}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal - Desktop */}
                        <div className="hidden sm:block text-right flex-shrink-0">
                          <p className="text-base md:text-lg font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {item.product && item.quantity >= item.product.stock && (
                        <p className="text-xs text-red-600 mt-1.5">
                          Max stock: {item.product.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5 sticky top-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Order Summary</h2>

              <div className="space-y-2.5 md:space-y-3 mb-4 md:mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-xs">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5 md:pt-3">
                  <div className="flex justify-between text-base md:text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full mb-2 md:mb-3 text-sm py-2 md:py-2.5"
                onClick={() => {
                  router.push('/checkout')
                }}
              >
                Proceed to Checkout
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full text-sm py-2 md:py-2.5">
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

