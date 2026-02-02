import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'

// Cache categories for 5 minutes (they don't change often)
export const revalidate = 300

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const categories = await db
      .collection<Category>('categories')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const formatted = categories.map((category) => ({
      id: category._id?.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
    }))

    const response = NextResponse.json({ categories: formatted })
    
    // Cache categories for 5 minutes, allow stale-while-revalidate for 1 hour
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    )
    
    return response
  } catch (error) {
    console.error('Public categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    )
  }
}


