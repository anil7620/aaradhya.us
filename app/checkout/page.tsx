'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductImage from '@/app/components/ProductImage'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCSRFHeaders } from '@/lib/csrf-client'
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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

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
        // Load saved addresses
        const addressesRes = await fetch('/api/user/addresses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json()
          setSavedAddresses(addressesData.addresses || [])
          // Auto-select default address if available
          const defaultAddress = addressesData.addresses?.find((a: any) => a.isDefault)
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id)
            setShippingAddress({
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              zipCode: defaultAddress.zipCode,
              country: defaultAddress.country,
            })
          }
        }
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
        // Guest checkout - load from session-based cart API
        const res = await fetch('/api/cart/guest')
        
        if (!res.ok) {
          router.push('/cart')
          return
        }

        const data = await res.json()
        const items = data.items || []
        
        if (items.length === 0) {
          router.push('/cart')
          return
        }

        setCartItems(items)
        
        // Calculate tax for guest cart (will be recalculated when state is selected)
        const itemsForTax = items
          .filter((item: CartItem) => item.product)
          .map((item: CartItem) => ({
            price: item.price,
            quantity: item.quantity,
          }))
        
        if (itemsForTax.length > 0) {
          // Calculate subtotal
          const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
          
          if (shippingAddress.state) {
            const stateCode = shippingAddress.state.toUpperCase().trim()
            if (stateCode.length === 2) {
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
                setSubtotal(subtotalCalc)
                setTaxAmount(0)
                setTaxRate(0)
                setTotal(subtotalCalc)
              }
            } else {
              // No tax calculation until valid state is entered
              setSubtotal(subtotalCalc)
              setTaxAmount(0)
              setTaxRate(0)
              setTotal(subtotalCalc)
            }
          } else {
            // No state entered yet - just show subtotal
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
      // Clear selected address if user manually edits
      if (selectedAddressId) {
        setSelectedAddressId(null)
      }
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

      // Include addressId if a saved address is selected
      if (selectedAddressId && isLoggedIn) {
        requestBody.addressId = selectedAddressId
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

      // Create order with CSRF token
      const headers = {
        ...getCSRFHeaders(),
        ...(token && { Authorization: `Bearer ${token}` }),
      }
      
      const createOrderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers,
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
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 md:mb-10">Add some products to checkout!</p>
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
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <span className="ml-2 font-medium text-sm text-gray-900">Shipping</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                2
              </div>
              <span className="ml-2 font-medium text-sm text-gray-600">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">Checkout</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Guest Information (if not logged in) */}
            {!isLoggedIn && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Guest Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm mb-1.5 block">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={guestInfo.firstName}
                      onChange={(e) => handleInputChange(e, 'guest')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm mb-1.5 block">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={guestInfo.lastName}
                      onChange={(e) => handleInputChange(e, 'guest')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm mb-1.5 block">Email *</Label>
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
                    <Label htmlFor="phoneNumber" className="text-sm mb-1.5 block">Phone Number</Label>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Shipping Address</h2>
              
              {/* Saved Addresses Selector (for logged-in users) */}
              {isLoggedIn && savedAddresses.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm mb-2 block">Use Saved Address</Label>
                  <select
                    value={selectedAddressId || ''}
                    onChange={(e) => {
                      const addressId = e.target.value
                      setSelectedAddressId(addressId || null)
                      if (addressId) {
                        const address = savedAddresses.find(a => a.id === addressId)
                        if (address) {
                          setShippingAddress({
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            zipCode: address.zipCode,
                            country: address.country,
                          })
                          // Recalculate tax when address changes
                          if (address.state && cartItems.length > 0) {
                            const stateCode = address.state.toUpperCase().trim()
                            if (stateCode.length === 2) {
                              const itemsForTax = cartItems
                                .filter((item: CartItem) => item.product)
                                .map((item: CartItem) => ({
                                  price: item.price,
                                  quantity: item.quantity,
                                }))
                              if (itemsForTax.length > 0) {
                                const subtotalCalc = itemsForTax.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
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
                              }
                            }
                          }
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                  >
                    <option value="">Enter new address</option>
                    {savedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label || address.type || 'Address'} - {address.street}, {address.city}, {address.state} {address.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                  <Link href="/addresses" className="text-xs text-primary hover:underline">
                    Manage addresses
                  </Link>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="street" className="text-sm mb-1.5 block">Street Address *</Label>
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
                    <Label htmlFor="city" className="text-sm mb-1.5 block">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm mb-1.5 block">State (2-letter code) *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      placeholder="CA, NY, TX"
                      maxLength={2}
                      className="uppercase"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="text-sm mb-1.5 block">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      placeholder="12345"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm mb-1.5 block">Country *</Label>
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
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure Checkout</span>
              </div>

              {/* Cart Items */}
              <div className="mb-4 pb-4 border-b border-gray-200 max-h-64 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    if (!item.product) return null
                    return (
                      <div key={item.productId} className="flex gap-3">
                        <div className="flex-shrink-0 w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <ProductImage
                            src={item.product.images?.[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                            {item.product.name}
                          </p>
                          <div className="space-y-0.5">
                            {item.selectedColor && (
                              <p className="text-xs text-gray-600">
                                Color: <span className="font-medium">{item.selectedColor}</span>
                              </p>
                            )}
                            {item.selectedFragrance && (
                              <p className="text-xs text-gray-600">
                                Fragrance: <span className="font-medium">{item.selectedFragrance}</span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Sales Tax {taxRate > 0 && `(${taxRate.toFixed(2)}%)`}
                    {!shippingAddress.state && ' - Select state'}
                  </span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full py-3 text-sm font-semibold mb-3"
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
                <Button variant="outline" className="w-full text-sm">
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
