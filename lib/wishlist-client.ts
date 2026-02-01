/**
 * Client-side Wishlist Utility
 * Provides unified interface for wishlist operations (authenticated and guest)
 */

import { getCSRFHeaders } from './csrf-client'

/**
 * Check if user is authenticated
 */
function isAuthenticated(): boolean {
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
 * Get wishlist (works for both authenticated and guest users)
 */
export async function getWishlist() {
  const authenticated = isAuthenticated()

  const headers: HeadersInit = {}

  if (authenticated) {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch('/api/wishlist', {
    headers,
  })

  if (!res.ok) {
    throw new Error('Failed to fetch wishlist')
  }

  return res.json()
}

/**
 * Add product to wishlist (works for both authenticated and guest users)
 */
export async function addToWishlist(productId: string) {
  const headers = getCSRFHeaders()

  const res = await fetch('/api/wishlist', {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to add to wishlist')
  }

  return res.json()
}

/**
 * Remove product from wishlist (works for both authenticated and guest users)
 */
export async function removeFromWishlist(productId: string) {
  const headers = getCSRFHeaders()

  const res = await fetch('/api/wishlist', {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ productId }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to remove from wishlist')
  }

  return res.json()
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const wishlist = await getWishlist()
    return wishlist.productIds?.includes(productId) || false
  } catch {
    return false
  }
}
