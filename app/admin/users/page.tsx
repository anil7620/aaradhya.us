'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, Shield } from 'lucide-react'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: string
  createdAt: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users')
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Failed to fetch users')

        setUsers(data.users || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-white/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Manage community
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  All Users
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  View and monitor every customer and admin on the platform.
                </p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-20 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-4">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-md p-5 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {user.phoneNumber && (
                      <p className="text-sm text-gray-400 mt-1">
                        📞 {user.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                      <Shield className="w-4 h-4" />
                      {user.role}
                    </span>
                    <p className="text-sm text-gray-400">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}


