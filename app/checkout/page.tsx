'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductImage from '@/app/components/ProductImage'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Tax calculation is done via API

interface CartItem {
  productId: string
  quantity: number
  price: number
  selectedColor?: string
  selectedFragrance?: string
  category?: string
  product: {
    _id: string
    name: string
    images: string[]
    category?: string
  } | null
}

interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface GuestInfo {
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
}

// No global Stripe declaration needed - we redirect to Stripe Checkout

export default function CheckoutPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  })
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  })

  useEffect(() => {
    checkAuthAndLoadCart()
  }, [])

  const checkAuthAndLoadCart = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (token) {
        setIsLoggedIn(true)
        // Load cart from API
        const res = await fetch('/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          const items = data.items || []
          setCartItems(items)
          
          // Calculate tax (will be recalculated when state is selected)
          const itemsForTax = items
            .filter((item: CartItem) => item.product)
            .map((item: CartItem) => ({
              price: item.price,
              quantity: item.quantity,
            }))
          
          if (itemsForTax.length > 0 && shippingAddress.state) {
            const stateCode = shippingAddress.state.toUpperCase().trim()
            if (stateCode.length === 2) {
              // Calculate subtotal first
              const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
              
              // Fetch tax rate from API
              try {
                const taxRes = await fetch(`/api/tax?state=${stateCode}`)
                if (taxRes.ok) {
                  const taxData = await taxRes.json()
                  const taxRate = taxData.enabled ? taxData.taxRate : 0
                  const taxAmount = (subtotalCalc * taxRate) / 100
                  
                  setSubtotal(subtotalCalc)
                  setTaxAmount(Math.round(taxAmount * 100) / 100)
                  setTaxRate(taxRate)
                  setTotal(Math.round((subtotalCalc + taxAmount) * 100) / 100)
                } else {
                  // Fallback if API fails
                  setSubtotal(subtotalCalc)
                  setTaxAmount(0)
                  setTaxRate(0)
                  setTotal(subtotalCalc)
                }
              } catch (err) {
                // Fallback on error
                const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
                setSubtotal(subtotalCalc)
                setTaxAmount(0)
                setTaxRate(0)
                setTotal(subtotalCalc)
              }
            } else {
              // No tax calculation until valid state is entered
              const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
              setSubtotal(subtotalCalc)
              setTaxAmount(0)
              setTaxRate(0)
              setTotal(subtotalCalc)
            }
          } else {
            setSubtotal(0)
            setTaxAmount(0)
            setTaxRate(0)
            setTotal(0)
          }
        }
      } else {
        // Guest checkout - load from localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
        if (localCart.length === 0) {
          router.push('/cart')
          return
        }

        // Fetch product details for guest cart
        const itemsWithProducts = await Promise.all(
          localCart.map(async (item: any) => {
            try {
              const productRes = await fetch(`/api/products/${item.productId}`)
              if (productRes.ok) {
                const productData = await productRes.json()
                return {
                  ...item,
                  category: productData.category,
                  product: {
                    _id: productData._id,
                    name: productData.name,
                    images: productData.images || [],
                    category: productData.category,
                  },
                }
              }
            } catch (err) {
              console.error('Error fetching product:', err)
            }
            return { ...item, product: null }
          })
        )

        const validItems = itemsWithProducts.filter((item: any) => item.product)
        setCartItems(validItems)
        
        // Calculate tax for guest cart (will be recalculated when state is selected)
        const itemsForTax = validItems.map((item: CartItem) => ({
          price: item.price,
          quantity: item.quantity,
        }))
        
        if (itemsForTax.length > 0 && shippingAddress.state) {
          const stateCode = shippingAddress.state.toUpperCase().trim()
          if (stateCode.length === 2) {
            // Calculate subtotal first
            const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
            
            // Fetch tax rate from API
            try {
              const taxRes = await fetch(`/api/tax?state=${stateCode}`)
              if (taxRes.ok) {
                const taxData = await taxRes.json()
                const taxRate = taxData.enabled ? taxData.taxRate : 0
                const taxAmount = (subtotalCalc * taxRate) / 100
                
                setSubtotal(subtotalCalc)
                setTaxAmount(Math.round(taxAmount * 100) / 100)
                setTaxRate(taxRate)
                setTotal(Math.round((subtotalCalc + taxAmount) * 100) / 100)
              } else {
                // Fallback if API fails
                setSubtotal(subtotalCalc)
                setTaxAmount(0)
                setTaxRate(0)
                setTotal(subtotalCalc)
              }
            } catch (err) {
              // Fallback on error
              const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
              setSubtotal(subtotalCalc)
              setTaxAmount(0)
              setTaxRate(0)
              setTotal(subtotalCalc)
            }
          } else {
            // No tax calculation until valid state is entered
            const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
            setSubtotal(subtotalCalc)
            setTaxAmount(0)
            setTaxRate(0)
            setTotal(subtotalCalc)
          }
        } else {
          setSubtotal(0)
          setTaxAmount(0)
          setTaxRate(0)
          setTotal(0)
        }
      }
    } catch (err) {
      console.error('Error loading cart:', err)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'shipping' | 'guest'
  ) => {
    const { name, value } = e.target
    if (type === 'shipping') {
      const newAddress = { ...shippingAddress, [name]: value }
      setShippingAddress(newAddress)
      
      // Recalculate tax when state changes
      if (name === 'state' && cartItems.length > 0) {
        const stateCode = value.toUpperCase().trim()
        if (stateCode.length === 2) {
          const itemsForTax = cartItems
            .filter((item: CartItem) => item.product)
            .map((item: CartItem) => ({
              price: item.price,
              quantity: item.quantity,
            }))
          
          if (itemsForTax.length > 0) {
            // Calculate subtotal
            const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
            
            // Fetch tax rate from API
            fetch(`/api/tax?state=${stateCode}`)
              .then(res => res.json())
              .then(taxData => {
                const taxRate = taxData.enabled ? taxData.taxRate : 0
                const taxAmount = (subtotalCalc * taxRate) / 100
                
                setSubtotal(subtotalCalc)
                setTaxAmount(Math.round(taxAmount * 100) / 100)
                setTaxRate(taxRate)
                setTotal(Math.round((subtotalCalc + taxAmount) * 100) / 100)
              })
              .catch(() => {
                // Fallback on error
                setSubtotal(subtotalCalc)
                setTaxAmount(0)
                setTaxRate(0)
                setTotal(subtotalCalc)
              })
          }
        }
      }
    } else {
      setGuestInfo((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = (): boolean => {
    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      setError('Please fill in all shipping address fields')
      return false
    }

    // Validate state code format (must be 2-letter US state code)
    const stateCode = shippingAddress.state.toUpperCase().trim()
    if (stateCode.length !== 2) {
      setError('State must be a valid 2-letter state code (e.g., CA, NY, TX)')
      return false
    }

    // Validate ZIP code format (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(shippingAddress.zipCode)) {
      setError('ZIP code must be in format 12345 or 12345-6789')
      return false
    }

    // Validate guest info if not logged in
    if (!isLoggedIn) {
      if (!guestInfo.email || !guestInfo.firstName || !guestInfo.lastName) {
        setError('Please fill in all required guest information')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
        setError('Please enter a valid email address')
        return false
      }
    }

    return true
  }

  const handleCheckout = async () => {
    if (!validateForm()) {
      return
    }

    if (cartItems.length === 0) {
      setError('Cart is empty')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      // Prepare request body
      const requestBody: any = {
        shippingAddress,
      }

      if (!isLoggedIn) {
        requestBody.guestInfo = guestInfo
        requestBody.items = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedFragrance: item.selectedFragrance,
        }))
      }

      // Create order
      const createOrderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      })

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const orderData = await createOrderRes.json()

      // Redirect to Stripe Checkout
      if (orderData.checkoutUrl) {
        // Clear guest cart if guest checkout (before redirect)
        if (!isLoggedIn) {
          localStorage.removeItem('cart')
        }
        // Redirect to Stripe Checkout
        window.location.href = orderData.checkoutUrl
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to process checkout')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to checkout!</p>
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information (if not logged in) */}
            {!isLoggedIn && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={guestInfo.firstName}
                      onChange={(e) => handleInputChange(e, 'guest')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={guestInfo.lastName}
                      onChange={(e) => handleInputChange(e, 'guest')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => handleInputChange(e, 'guest')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={guestInfo.phoneNumber}
                      onChange={(e) => handleInputChange(e, 'guest')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    name="street"
                    value={shippingAddress.street}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State (2-letter code) *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      placeholder="CA, NY, TX, etc."
                      maxLength={2}
                      className="uppercase"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 2-letter state code (e.g., CA for California)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      placeholder="12345 or 12345-6789"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-4 items-center">
                    {item.product && (
                      <>
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <ProductImage
                            src={item.product.images?.[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Sales Tax {taxRate > 0 && `(${taxRate.toFixed(2)}%)`}
                    {!shippingAddress.state && ' - Select state'}
                  </span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mb-4"
                onClick={handleCheckout}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>

              <Link href="/cart">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
