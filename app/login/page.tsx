'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({ items: cartItems }),
          })
          // Clear localStorage cart after sync
          localStorage.removeItem('cart')
        } catch (err) {
          console.error('Error syncing cart:', err)
        }
      }
      
      router.push(data.redirect || '/dashboard')
      router.refresh()
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-sage/10 via-white to-sage/10 p-4">
      <motion.div 
        className="w-full max-w-2xl bg-card text-card-foreground rounded-2xl shadow-2xl border p-8 md:p-10 lg:p-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Login Form */}
        <div className="w-full flex flex-col items-center justify-center">
          <motion.div 
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight mb-3 text-center">
              Welcome Back
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8 text-center text-lg">
              Enter your credentials to access your account.
            </motion.p>

            {error && (
              <motion.div 
                variants={itemVariants}
                className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
              >
                {error}
              </motion.div>
            )}

            <motion.form variants={itemVariants} className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </motion.form>

            <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
