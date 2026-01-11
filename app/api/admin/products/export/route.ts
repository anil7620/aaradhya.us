import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/lib/models/Product'
import { verifyToken } from '@/lib/auth'
import { objectsToCsv } from '@/lib/csv'

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
    const products = await db
      .collection<Product>('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const rows = products.map((product) => ({
      id: product._id?.toString() ?? '',
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: (product.images || []).join(' | '),
      isActive: product.isActive ? 'true' : 'false',
      createdAt: product.createdAt?.toISOString() ?? '',
      updatedAt: product.updatedAt?.toISOString() ?? '',
      createdBy: (product.createdBy as ObjectId | undefined)?.toString() ?? '',
    }))

    const csv = objectsToCsv(rows, [
      'id',
      'name',
      'description',
      'price',
      'category',
      'stock',
      'images',
      'isActive',
      'createdAt',
      'updatedAt',
      'createdBy',
    ])

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products-export.csv"',
      },
    })
  } catch (error) {
    console.error('Error exporting products:', error)
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    )
  }
}


