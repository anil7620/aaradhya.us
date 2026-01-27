import { NextResponse } from 'next/server'
import { getFeaturedProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const products = await getFeaturedProducts(limit)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
