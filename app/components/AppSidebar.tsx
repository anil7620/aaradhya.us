'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  FileText,
  Tag,
  User as UserIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from './Logo'
import { getCurrentUser, JWTPayload } from '@/lib/auth-client'

interface UserDetails {
  firstName: string
  lastName: string
  name: string
  email: string
  role: string
}

export default function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
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
  }, [])

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
    router.refresh()
  }

  if (!user) return null

  // Common links for all users
  const commonLinks = [
    {
      label: 'Dashboard',
      href: user.role === 'admin' ? '/admin' : '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Products',
      href: '/products',
      icon: ShoppingBag,
    },
  ]

  // Role-specific links
  const adminLinks = [
    {
      label: 'All Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'All Products',
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: Tag,
    },
    {
      label: 'All Orders',
      href: '/admin/orders',
      icon: FileText,
    },
    {
      label: 'Edit Homepage',
      href: '/admin/homepage',
      icon: Settings,
    },
  ]

  const customerLinks = [
    {
      label: 'My Orders',
      href: '/orders',
      icon: FileText,
    },
    {
      label: 'My Profile',
      href: '/profile',
      icon: UserIcon,
    },
  ]

  // Combine links based on role
  let allLinks = [...commonLinks]
  if (user.role === 'admin') {
    allLinks = [...allLinks, ...adminLinks]
  } else if (user.role === 'customer') {
    allLinks = [...allLinks, ...customerLinks]
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="flex flex-col h-full bg-gradient-to-b from-white to-sage/10/30">
        {/* Logo Section - Compact and practical */}
        <div className="mb-4 px-3 pt-3">
          <Link 
            href="/" 
            className="flex items-center justify-center group hover:opacity-80 transition-opacity duration-200"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Logo className="h-8 w-auto flex-shrink-0" />
            </motion.div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3">
          <div className="flex flex-col gap-2">
            {allLinks.map((link, idx) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-sage text-white shadow-lg shadow-primary/30'
                        : 'text-gray-700 hover:bg-sage/10 hover:text-primary'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary'
                    } ${open ? 'group-hover:scale-110' : ''}`} />
                    {open && (
                      <span className={`text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary'
                      }`}>
                        {link.label}
                      </span>
                    )}
                    {isActive && open && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-sage/30/50 pt-4 pb-4 px-3 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-sage rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-semibold text-sm">
                {userDetails?.name?.charAt(0)?.toUpperCase() || userDetails?.firstName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userDetails?.name || userDetails?.firstName || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize font-medium">
                  {user.role}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-3 group py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {open && (
              <span className="text-sm font-medium whitespace-nowrap">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}

