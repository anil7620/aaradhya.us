'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCSRFHeaders } from '@/lib/csrf-client'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    joinPromotions: false,
    role: 'customer' as 'customer',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailChecking, setEmailChecking] = useState(false)

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

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number (US format: 10 digits, optional +1)
  const validatePhone = (phone: string): boolean => {
    // Remove spaces, dashes, parentheses, and dots
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
    // Check if it's a valid US phone number (10 digits, optionally with +1)
    // Format: +1XXXXXXXXXX or (XXX) XXX-XXXX or XXX-XXX-XXXX or XXXXXXXXXX
    const phoneRegex = /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/
    return phoneRegex.test(cleaned)
  }

  // Validate password strength
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' }
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' }
    }
    return { valid: true, message: '' }
  }

  // Check if email exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      return data.exists || false
    } catch {
      return false
    }
  }

  const handleEmailBlur = async () => {
    if (!formData.email) {
      setEmailError('')
      return
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailChecking(true)
    const exists = await checkEmailExists(formData.email)
    setEmailChecking(false)

    if (exists) {
      setEmailError('This email is already registered')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    if (password) {
      const validation = validatePassword(password)
      setPasswordError(validation.valid ? '' : validation.message)
    } else {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // Validate email
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    // Check if email exists
    setEmailChecking(true)
    const emailExists = await checkEmailExists(formData.email)
    setEmailChecking(false)
    if (emailExists) {
      setEmailError('This email is already registered')
      return
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message)
      return
    }

    // Validate phone number
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      setPhoneError('Please enter a valid phone number (10 digits)')
      return
    }

    // Validate terms acceptance
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions and privacy policy to register')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
          acceptTerms: formData.acceptTerms,
          joinPromotions: formData.joinPromotions,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Auto login after registration
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
      
      router.push('/products')
      router.refresh()
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 p-3 sm:p-4 lg:p-6 py-4 sm:py-6">
      <motion.div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-5 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Register Form */}
        <div className="w-full">
          <motion.div 
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-4 md:mb-5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-secondary">
                Create Account
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                Sign up to start shopping for authentic puja items.
              </p>
            </motion.div>

            {error && (
              <motion.div 
                variants={itemVariants}
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 md:mb-4 text-xs sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.form variants={itemVariants} className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm font-semibold text-gray-700">
                    First Name
                  </Label>
                  <Input 
                    id="firstName" 
                    type="text" 
                    placeholder="First name" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-9 md:h-10 text-sm border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm font-semibold text-gray-700">
                    Last Name
                  </Label>
                  <Input 
                    id="lastName" 
                    type="text" 
                    placeholder="Last name" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-9 md:h-10 text-sm border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setEmailError('')
                  }}
                  onBlur={handleEmailBlur}
                  className={`h-9 md:h-10 text-sm border-gray-300 focus:border-primary focus:ring-primary ${emailError ? 'border-red-500' : ''}`}
                />
                {emailChecking && (
                  <p className="text-[10px] sm:text-xs text-gray-500">Checking email...</p>
                )}
                {emailError && (
                  <p className="text-[10px] sm:text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </Label>
                <Input 
                  id="phoneNumber" 
                  type="tel" 
                  placeholder="(555) 123-4567" 
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value })
                    setPhoneError('')
                  }}
                  className={`h-9 md:h-10 text-sm border-gray-300 focus:border-primary focus:ring-primary ${phoneError ? 'border-red-500' : ''}`}
                />
                {phoneError && (
                  <p className="text-[10px] sm:text-xs text-red-600">{phoneError}</p>
                )}
                {!phoneError && formData.phoneNumber && (
                  <p className="text-[10px] sm:text-xs text-gray-500">Format: (555) 123-4567</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Min 8 chars: uppercase, number & special char"
                  required 
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`h-9 md:h-10 text-sm border-gray-300 focus:border-primary focus:ring-primary ${passwordError ? 'border-red-500' : ''}`}
                />
                {passwordError && (
                  <p className="text-[10px] sm:text-xs text-red-600">{passwordError}</p>
                )}
                {!passwordError && formData.password && (
                  <p className="text-[10px] sm:text-xs text-green-600">✓ Password strength: Good</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Confirm Password
                </Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Re-enter your password"
                  required 
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (e.target.value && e.target.value !== formData.password) {
                      setConfirmPasswordError('Passwords do not match')
                    } else {
                      setConfirmPasswordError('')
                    }
                  }}
                  className={`h-9 md:h-10 text-sm border-gray-300 focus:border-primary focus:ring-primary ${confirmPasswordError ? 'border-red-500' : ''}`}
                />
                {confirmPasswordError && (
                  <p className="text-[10px] sm:text-xs text-red-600">{confirmPasswordError}</p>
                )}
                {!confirmPasswordError && formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <p className="text-[10px] sm:text-xs text-green-600">✓ Passwords match</p>
                )}
              </div>
              
              {/* Terms and Conditions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    required
                    checked={formData.acceptTerms === true}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 flex-shrink-0"
                  />
                  <Label htmlFor="acceptTerms" className="text-xs sm:text-sm text-gray-700 cursor-pointer leading-snug">
                    I accept the <Link href="/terms" className="text-primary hover:text-primary-600 transition-colors font-medium">Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:text-primary-600 transition-colors font-medium">Privacy Policy</Link>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="joinPromotions"
                    checked={formData.joinPromotions}
                    onChange={(e) => setFormData({ ...formData, joinPromotions: e.target.checked })}
                    className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 flex-shrink-0"
                  />
                  <Label htmlFor="joinPromotions" className="text-xs sm:text-sm text-gray-700 cursor-pointer leading-snug">
                    Join for promotions and email updates
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-9 md:h-10 bg-primary hover:bg-primary-600 text-white font-semibold text-sm md:text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 mt-2" 
                disabled={loading || !formData.acceptTerms}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-3 md:mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-primary-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
