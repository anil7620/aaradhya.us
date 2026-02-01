'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCurrentUser, JWTPayload } from '@/lib/auth-client'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText,
  TrendingUp,
  ArrowRight,
  Shield,
  Sparkles,
  Tag,
} from 'lucide-react'

interface UserDetails {
  firstName: string
  lastName: string
  name: string
  email: string
  role: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (currentUser.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUser(currentUser)

    // Fetch user details
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUserDetails(data)
        }
      })
      .catch(err => console.error('Error fetching user details:', err))
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    // Fetch stats
    if (token) {
      fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.stats) {
            setStats(data.stats)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ]

  const managementCards = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      href: '/admin/users',
      icon: Users,
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-100',
    },
    {
      title: 'Manage Products',
      description: 'View and manage all products',
      href: '/admin/products',
      icon: Package,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Manage Categories',
      description: 'Curate storefront navigation and group products',
      href: '/admin/categories',
      icon: Tag,
      gradient: 'from-primary to-sage',
      iconBg: 'bg-sage/20',
    },
    {
      title: 'Manage Orders',
      description: 'View and manage all orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100',
    },
    {
      title: 'Edit Homepage',
      description: 'Manage homepage content and sections',
      href: '/admin/homepage',
      icon: FileText,
      gradient: 'from-slate-500 to-gray-600',
      iconBg: 'bg-slate-100',
    },
    {
      title: 'Tax Settings',
      description: 'Configure US sales tax rates by state',
      href: '/admin/tax',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Section */}
          <motion.div variants={itemVariants} className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Platform Overview
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    {/* Gradient Accent */}
                    <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`${stat.iconBg} w-10 h-10 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.textColor}`} />
                        </div>
                      </div>
                      <h3 className="text-gray-600 text-xs font-medium mb-1">
                        {stat.title}
                      </h3>
                      <p className={`text-3xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Management Section */}
          <motion.div variants={itemVariants} className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Quick Actions
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {managementCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Link href={card.href}>
                    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                      {/* Gradient Accent */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>
                      
                      <div className="p-4">
                        {/* Icon */}
                        <div className={`${card.iconBg} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5 text-gray-700" />
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 mb-3 text-xs leading-relaxed">
                          {card.description}
                        </p>
                        
                        {/* Arrow */}
                        <div className="flex items-center text-primary font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </div>
                      </div>
                      
                      {/* Hover Effect Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

