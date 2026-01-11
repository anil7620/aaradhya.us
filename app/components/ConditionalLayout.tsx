'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import AnnouncementBar from './AnnouncementBar'
import Footer from './Footer'
import AppSidebar from './AppSidebar'
import { AnnouncementBar as AnnouncementBarType, FooterContent } from '@/lib/models/HomepageContent'
import { getCurrentUser } from '@/lib/auth-client'

export default function ConditionalLayout({ 
  children,
  announcementBar,
  footerContent
}: { 
  children: React.ReactNode
  announcementBar?: AnnouncementBarType
  footerContent?: FooterContent
}) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    setIsLoggedIn(!!user)
    setUserRole(user?.role || null)
    setLoading(false)
  }, [pathname])

  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isPublicPage = pathname === '/' || pathname.startsWith('/products')

  // For admins on dashboard/admin pages, show sidebar (no navbar)
  // Customers use regular navbar
  if (!loading && isLoggedIn && userRole && userRole !== 'customer' && !isPublicPage && !isAuthPage) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
            <Footer content={footerContent} />
          </main>
        </div>
      </div>
    )
  }

  // Show navbar and footer on all pages (including auth pages)
  // Show announcement bar only if user is NOT logged in and NOT on auth pages
  return (
    <>
      {!loading && !isLoggedIn && !isAuthPage && <AnnouncementBar content={announcementBar} />}
      <Navbar />
      {children}
      <Footer content={footerContent} />
    </>
  )
}

