import { NextResponse } from 'next/server'
import { getBestSellers } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const products = await getBestSellers(limit)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching best sellers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
