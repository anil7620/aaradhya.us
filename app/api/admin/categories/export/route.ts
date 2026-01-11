import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'
import { objectsToCsv } from '@/lib/csv'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db()
    const categories = await db
      .collection<Category>('categories')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const rows = categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      color: category.color ?? '',
      icon: category.icon ?? '',
      createdAt: category.createdAt?.toISOString() ?? '',
    }))

    const csv = objectsToCsv(rows, [
      'name',
      'slug',
      'description',
      'color',
      'icon',
      'createdAt',
    ])

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="categories-export.csv"',
      },
    })
  } catch (error) {
    console.error('Error exporting categories:', error)
    return NextResponse.json(
      { error: 'Failed to export categories' },
      { status: 500 }
    )
  }
}


