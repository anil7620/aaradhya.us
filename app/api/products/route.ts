import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

// Cache products for 60 seconds, revalidate on demand
export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')

    const products = await getProducts({ category, search, limit })
    
    const response = NextResponse.json({ products })
    
    // Add cache headers for better performance
    // Cache for 60 seconds, allow stale-while-revalidate for 300 seconds
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
    
    return response
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

