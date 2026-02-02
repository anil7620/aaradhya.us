import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Public stats endpoint for homepage display
// Cache for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get real statistics
    const [totalCustomers, totalOrders, deliveredOrders] = await Promise.all([
      db.collection('users').countDocuments({ role: 'customer' }),
      db.collection('orders').countDocuments(),
      db.collection('orders').countDocuments({ status: 'delivered' }),
    ])

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K+`
      }
      return num.toString()
    }

    return NextResponse.json({
      stats: {
        totalCustomers: formatNumber(totalCustomers),
        totalOrders: formatNumber(totalOrders),
        deliveredOrders: formatNumber(deliveredOrders),
        raw: {
          totalCustomers,
          totalOrders,
          deliveredOrders,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching public stats:', error)
    // Return default values on error
    return NextResponse.json({
      stats: {
        totalCustomers: '1K+',
        totalOrders: '500+',
        deliveredOrders: '500+',
        raw: {
          totalCustomers: 1000,
          totalOrders: 500,
          deliveredOrders: 500,
        },
      },
    })
  }
}
