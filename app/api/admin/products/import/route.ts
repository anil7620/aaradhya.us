import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/lib/models/Product'
import { verifyToken } from '@/lib/auth'
import { csvToObjects } from '@/lib/csv'

function toBoolean(value?: string) {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return !['false', '0', 'no', 'inactive'].includes(normalized)
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
    const adminId = new ObjectId(payload.userId)

    const operations = rows
      .map((row) => {
        const name = row.name || row.Name
        if (!name) return null

        const description =
          row.description || row.Description || 'Imported product'
        const price = Number(row.price || row.Price || 0)
        const stock = Number(row.stock || row.Stock || 0)
        const category =
          row.category || row.Category || row.categorySlug || 'uncategorized'
        const images = (row.images || row.Images || '')
          .split(/[,|]/)
          .map((img) => img.trim())
          .filter(Boolean)

        const product: Product = {
          name,
          description,
          price,
          category,
          images,
          stock,
          createdBy: adminId,
          createdAt: now,
          updatedAt: now,
          isActive: toBoolean(row.isActive || row.IsActive),
        }

        return {
          updateOne: {
            filter: { name },
            update: { $set: { ...product, updatedAt: now } },
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
    await db.collection<Product>('products').bulkWrite(operations)

    return NextResponse.json({ imported: operations.length })
  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    )
  }
}


