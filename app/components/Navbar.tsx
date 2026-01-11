'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getCurrentUser, JWTPayload } from '@/lib/auth-client'
import { User, ShoppingBag, History, Settings, LogOut, ChevronDown } from 'lucide-react'
import Logo from './Logo'

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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<NavCategory[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            <Link href="/" className="flex items-center">
              <Logo className="w-16 h-16" />
            </Link>
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
          <Link href="/" className="flex items-center">
            <Logo className="w-20 h-20" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary font-medium">
              Shop
            </Link>
            <Link href="/products?category=puja" className="text-gray-700 hover:text-primary font-medium">
              Puja Items
            </Link>
            <Link href="/products?category=brass" className="text-gray-700 hover:text-primary font-medium">
              Brass Products
            </Link>
            {user && user.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-primary font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
              className="relative flex items-center text-gray-700 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-3 hidden md:flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Categories
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-700 hover:bg-sage/10 hover:text-primary transition-colors border border-transparent"
                  style={
                    category.color
                      ? { borderColor: category.color + '33', backgroundColor: category.color + '14' }
                      : undefined
                  }
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:hidden px-4 pb-3 overflow-x-auto">
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-700 hover:bg-sage/10 hover:text-primary transition-colors border border-transparent"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

