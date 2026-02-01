'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle2, User, Loader2 } from 'lucide-react'

interface ProfileForm {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/me')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch profile')
        }

        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
        })
      } catch (err) {
        setMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Failed to load profile',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-3 md:py-4 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-3 md:mb-4">
            <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 border border-white/60 flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-sage flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-0.5 md:mt-1">
                  Profile Settings
                </h1>
                
              </div>
            </div>
          </motion.div>

          {message && (
            <motion.div
              variants={itemVariants}
              className={`rounded-xl p-3 md:p-4 mb-3 md:mb-4 border text-xs md:text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-12 rounded-xl bg-white/60 animate-pulse" />
              ))}
            </motion.div>
          ) : (
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-xl border border-white/60 p-4 md:p-5 lg:p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs md:text-sm mb-1 block">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs md:text-sm mb-1 block">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-xs md:text-sm mb-1 block">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-9 md:h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs md:text-sm mb-1 block">Email (read-only)</Label>
                <Input id="email" value={formData.email} disabled className="h-9 md:h-10 text-sm bg-gray-50" />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2 md:pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                  Your information is encrypted and stored securely.
                </div>
                <Button type="submit" className="w-full md:w-auto text-sm" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  )
}


