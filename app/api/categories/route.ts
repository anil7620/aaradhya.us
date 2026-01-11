import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'

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

    return NextResponse.json({ categories: formatted })
  } catch (error) {
    console.error('Public categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    )
  }
}


