import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'
import { ObjectId } from 'mongodb'

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { payload }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

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
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))

    return NextResponse.json({ categories: formatted })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const { name, slug, description, icon, color } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const existing = await db.collection<Category>('categories').findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    const now = new Date()
    const category: Category = {
      name,
      slug,
      description,
      icon,
      color,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Category>('categories').insertOne(category)

    return NextResponse.json({
      category: {
        id: result.insertedId.toString(),
        ...category,
      },
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const { id, name, slug, description, icon, color } = await request.json()

    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: 'ID, name, and slug are required' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if slug is already taken by another category
    const existing = await db.collection<Category>('categories').findOne({ 
      slug,
      _id: { $ne: new ObjectId(id) }
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    const updateResult = await db
      .collection<Category>('categories')
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            name,
            slug,
            description,
            icon,
            color,
            updatedAt: new Date()
          } 
        }
      )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updated = await db
      .collection<Category>('categories')
      .findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      category: {
        id: updated!._id?.toString(),
        name: updated!.name,
        slug: updated!.slug,
        description: updated!.description,
        icon: updated!.icon,
        color: updated!.color,
        createdAt: updated!.createdAt,
        updatedAt: updated!.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const deleteResult = await db
      .collection<Category>('categories')
      .deleteOne({ _id: new ObjectId(id) })

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}


