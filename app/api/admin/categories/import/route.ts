import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'
import { verifyToken } from '@/lib/auth'
import { csvToObjects } from '@/lib/csv'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const csvText = await request.text()
    if (!csvText.trim()) {
      return NextResponse.json({ error: 'Empty CSV provided' }, { status: 400 })
    }

    const rows = csvToObjects(csvText)
    const now = new Date()
    const operations = rows
      .map((row) => {
        const name =
          row.name || row.Name || row.categoryName || row.CategoryName || ''
        const slugInput = row.slug || row.Slug || ''
        if (!name && !slugInput) {
          return null
        }

        const slug = slugInput ? slugify(slugInput) : slugify(name)

        const category: Category = {
          name: name || slug,
          slug,
          description:
            row.description || row.Description || row.details || undefined,
          icon: row.icon || row.Icon || undefined,
          color: row.color || row.Color || '#f472b6',
          createdAt: now,
          updatedAt: now,
        }

        return {
          updateOne: {
            filter: { slug },
            update: { $set: { ...category, updatedAt: now } },
            upsert: true,
          },
        }
      })
      .filter(Boolean) as any[]

    if (!operations.length) {
      return NextResponse.json(
        { error: 'No valid rows found in CSV' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    await db.collection<Category>('categories').bulkWrite(operations)

    return NextResponse.json({ imported: operations.length })
  } catch (error) {
    console.error('Error importing categories:', error)
    return NextResponse.json(
      { error: 'Failed to import categories' },
      { status: 500 }
    )
  }
}


