'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCurrentUser, JWTPayload } from '@/lib/auth-client'
import { 
  ShoppingBag, 
  User, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface UserDetails {
  firstName: string
  lastName: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    // Fetch user details to get name
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Error fetching user details:', data.error)
        } else {
          setUserDetails(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching user details:', err)
        setLoading(false)
      })
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

  if (!user) {
    return null
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

  const customerCards = [
    {
      title: 'My Orders',
      description: 'View and track your order history',
      href: '/orders',
      icon: ShoppingBag,
      gradient: 'from-primary to-sage',
      iconBg: 'bg-sage/20',
    },
    {
      title: 'My Profile',
      description: 'Manage your account information',
      href: '/profile',
      icon: User,
      gradient: 'from-purple-500 to-primary',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Continue Shopping',
      description: 'Browse our collection of handmade products',
      href: '/products',
      icon: Sparkles,
      gradient: 'from-blue-500 to-purple-500',
      iconBg: 'bg-blue-100',
    },
  ]

  const adminCards = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      href: '/admin/users',
      icon: Users,
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-100',
    },
    {
      title: 'All Products',
      description: 'Manage all products in your store',
      href: '/admin/products',
      icon: Package,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100',
    },
    {
      title: 'All Orders',
      description: 'View and manage all customer orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100',
    },
    {
      title: 'Admin Dashboard',
      description: 'Access admin panel and settings',
      href: '/admin',
      icon: Settings,
      gradient: 'from-gray-500 to-slate-500',
      iconBg: 'bg-gray-100',
    },
  ]

  const cards = user.role === 'customer' ? customerCards : adminCards

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-white to-sage/10">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-gradient-to-r from-primary to-sage rounded-2xl shadow-xl p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Welcome back! 👋
                </h1>
                <p className="text-xl md:text-2xl text-sage/20 mb-2">
                  {userDetails?.name || userDetails?.firstName || user.email}
                </p>
                <p className="text-sm text-sage/30 mb-4">
                  {user.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Quick Actions
            </h2>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Link href={card.href}>
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                      {/* Gradient Accent */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>
                      
                      <div className="p-6">
                        {/* Icon */}
                        <div className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-gray-700" />
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          {card.description}
                        </p>
                        
                        {/* Arrow */}
                        <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                          <span>Explore</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
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

          {/* Additional Info for Customers */}
          {user.role === 'customer' && (
            <motion.div variants={itemVariants} className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-primary">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  💡 Pro Tip
                </h3>
                <p className="text-gray-600">
                  Keep track of your orders and update your profile to get the best shopping experience. 
                  Don't forget to check out our latest handmade products!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

