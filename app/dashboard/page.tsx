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
      <div className="container mx-auto px-4 py-4 md:py-8 lg:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="mb-4 md:mb-6 lg:mb-8">
            <div className="bg-gradient-to-r from-primary to-sage rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-3">
                  Welcome back! 👋
                </h1>
                <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-sage/20 mb-1 md:mb-2">
                  {userDetails?.name || userDetails?.firstName || user.email}
                </p>
                <p className="text-xs md:text-sm text-sage/30 mb-2 md:mb-4">
                  {user.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-4 md:mb-6 lg:mb-8">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-3 md:mb-4 lg:mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Quick Actions
            </h2>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Link href={card.href}>
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                      {/* Gradient Accent */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>
                      
                      <div className="p-4 md:p-6">
                        {/* Icon */}
                        <div className={`${card.iconBg} w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1.5 md:mb-2 group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 mb-3 md:mb-4 text-xs md:text-sm">
                          {card.description}
                        </p>
                        
                        {/* Arrow */}
                        <div className="flex items-center text-primary font-semibold text-xs md:text-sm group-hover:translate-x-2 transition-transform duration-300">
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-2" />
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

