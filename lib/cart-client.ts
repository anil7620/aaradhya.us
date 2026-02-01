/**
 * Client-side Cart Utility
 * Provides unified interface for cart operations (authenticated and guest)
 */

import { getCSRFHeaders } from './csrf-client'

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1]

  return !!token
}

/**
 * Get cart (works for both authenticated and guest users)
 */
export async function getCart() {
  const authenticated = isAuthenticated()

  if (authenticated) {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    const res = await fetch('/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch cart')
    }

    return res.json()
  } else {
    // Guest cart
    const res = await fetch('/api/cart/guest')

    if (!res.ok) {
      throw new Error('Failed to fetch cart')
    }

    return res.json()
  }
}

/**
 * Add item to cart (works for both authenticated and guest users)
 */
export async function addToCart(
  productId: string,
  quantity: number,
  selectedColor?: string,
  selectedFragrance?: string
) {
  const authenticated = isAuthenticated()

  const csrfHeaders = getCSRFHeaders()

  if (authenticated) {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    const headers: HeadersInit = {
      ...csrfHeaders,
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId,
        quantity,
        selectedColor: selectedColor || undefined,
        selectedFragrance: selectedFragrance || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to add to cart')
    }

    // Dispatch event to update cart count in Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    return res.json()
  } else {
    // Guest cart
    const res = await fetch('/api/cart/guest', {
      method: 'POST',
      headers: csrfHeaders,
      body: JSON.stringify({
        productId,
        quantity,
        selectedColor: selectedColor || undefined,
        selectedFragrance: selectedFragrance || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to add to cart')
    }

    // Dispatch event to update cart count in Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    return res.json()
  }
}

/**
 * Update cart item quantity (works for both authenticated and guest users)
 */
export async function updateCartItem(productId: string, quantity: number) {
  const authenticated = isAuthenticated()

  const csrfHeaders = getCSRFHeaders()

  if (authenticated) {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    const headers: HeadersInit = {
      ...csrfHeaders,
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ productId, quantity }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to update cart')
    }

    // Dispatch event to update cart count in Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    return res.json()
  } else {
    // Guest cart
    const res = await fetch('/api/cart/guest', {
      method: 'PUT',
      headers: csrfHeaders,
      body: JSON.stringify({ productId, quantity }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to update cart')
    }

    // Dispatch event to update cart count in Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    return res.json()
  }
}

/**
 * Remove item from cart (works for both authenticated and guest users)
 */
export async function removeFromCart(productId: string) {
  const authenticated = isAuthenticated()

  const csrfHeaders = getCSRFHeaders()

  if (authenticated) {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    const headers: HeadersInit = {
      ...csrfHeaders,
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ productId }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to remove from cart')
    }

    // Dispatch event to update cart count in Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    return res.json()
  } else {
    // Guest cart
    const res = await fetch('/api/cart/guest', {
      method: 'DELETE',
      headers: csrfHeaders,
      body: JSON.stringify({ productId }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to remove from cart')
    }

    // Dispatch event to update cart count in Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }

    return res.json()
  }
}
