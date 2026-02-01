'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCSRFHeaders } from '@/lib/csrf-client'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Set cookie
      document.cookie = `token=${data.token}; path=/; max-age=604800`
      
      // Sync localStorage cart to database
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
      if (cartItems.length > 0) {
        try {
          const csrfHeaders = getCSRFHeaders()
          const headers: HeadersInit = {
            ...csrfHeaders,
            Authorization: `Bearer ${data.token}`,
          }

          await fetch('/api/cart/sync', {
            method: 'POST',
            headers,
            body: JSON.stringify({ items: cartItems }),
          })
          // Clear localStorage cart after sync
          localStorage.removeItem('cart')
        } catch (err) {
          console.error('Error syncing cart:', err)
        }
      }
      
      router.push(data.redirect || '/products')
      router.refresh()
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <motion.div 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Login Form */}
        <div className="w-full">
          <motion.div 
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-secondary">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Enter your credentials to access your account.
              </p>
            </motion.div>

            {error && (
              <motion.div 
                variants={itemVariants}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.form variants={itemVariants} className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <Link href="#" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary-600 text-white font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-primary hover:text-primary-600 transition-colors">
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
