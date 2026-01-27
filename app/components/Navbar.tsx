'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getCurrentUser, JWTPayload } from '@/lib/auth-client'
import { User, ShoppingBag, History, Settings, LogOut, ChevronDown, X, Search } from 'lucide-react'
import Logo from './Logo'
import ProductImage from './ProductImage'

interface UserDetails {
  firstName: string
  lastName: string
  name: string
  email: string
  role: string
}

interface NavCategory {
  id: string
  name: string
  slug: string
  color?: string
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<NavCategory[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)

  const checkUser = () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
    
    // Fetch user details if logged in
    if (currentUser) {
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUserDetails(data)
          }
        })
        .catch(err => console.error('Error fetching user details:', err))
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCategories(data.categories || [])
        }
      })
      .catch((err) => console.error('Error fetching categories:', err))
  }, [])

  // Re-check user on route changes
  useEffect(() => {
    checkUser()
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the search button
        const target = event.target as HTMLElement
        if (!target.closest('button[aria-label="Toggle search"]') && !target.closest('[data-search-modal]')) {
          setSearchOpen(false)
          setSearchQuery('')
          setSearchResults([])
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close search on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [searchOpen])

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Search products with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.products || [])
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
    setUserDetails(null)
    setDropdownOpen(false)
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo className="w-16 h-16" />
            <div className="space-x-4">
              <span className="text-gray-400">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo className="w-20 h-20" />

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Shop
            </Link>
            <Link href="/products?category=puja" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Puja Items
            </Link>
            <Link href="/products?category=brass" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Brass Products
            </Link>
            {user && user.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-primary font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Search */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                if (!searchOpen) {
                  setSearchQuery('')
                  setSearchResults([])
                }
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Search products...</span>
            </button>

            {/* User Account Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-sage rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userDetails?.name?.charAt(0)?.toUpperCase() || userDetails?.firstName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {userDetails?.name || userDetails?.firstName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-primary to-sage p-4 text-white">
                      <p className="font-semibold text-lg">
                        {userDetails?.name || userDetails?.firstName || 'User'}
                      </p>
                      <p className="text-sm text-white/80 mt-1">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-sage/10 transition-colors text-gray-700"
                      >
                        <User className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                      
                      <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-sage/10 transition-colors text-gray-700"
                      >
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                      
                      <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-sage/10 transition-colors text-gray-700"
                      >
                        <History className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Transaction History</span>
                      </Link>
                      
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-sage/10 transition-colors text-gray-700"
                      >
                        <Settings className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Profile Settings</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-gray-700"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline text-sm">Sign In</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center text-gray-700 hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-4 pt-4 animate-in slide-in-from-top duration-200">
            <div className="space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/products?category=puja"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Puja Items
              </Link>
              <Link
                href="/products?category=brass"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Brass Products
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors border border-primary"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-20 md:pt-24 px-4 animate-in fade-in duration-200">
          <div 
            ref={searchModalRef}
            data-search-modal
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-top-4 duration-300"
          >
            {/* Search Input */}
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for puja items, brass products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-0 py-2 border-0 focus:outline-none focus:ring-0 text-base md:text-lg placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      searchInputRef.current?.focus()
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searchLoading ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Searching...</p>
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <p className="text-gray-600 mb-2">No products found</p>
                  <p className="text-sm text-gray-400">Try different keywords</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </div>
                  <div className="space-y-1">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="flex items-center gap-4 p-3 md:p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 relative rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                          {product.images?.[0] ? (
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {product.description}
                          </p>
                          <p className="text-primary font-bold mt-2">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {searchResults.length >= 8 && (
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="block px-4 py-3 text-center text-primary font-medium hover:bg-gray-50 transition-colors border-t border-gray-200"
                    >
                      View all results →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Start typing to search</p>
                  <p className="text-sm text-gray-400">Search for puja items, brass products, and more</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

