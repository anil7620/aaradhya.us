'use client'

// Client-side JWT decoder (without verification since we trust our own tokens)
export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'customer'
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1] || null
  )
}

export function getCurrentUser(): JWTPayload | null {
  const token = getTokenFromCookie()
  if (!token) return null
  return decodeToken(token)
}

