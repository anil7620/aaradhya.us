import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/lib/models/Product'
import { normalizeImageUrls } from '@/lib/images'

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
    const products = await db
      .collection<Product>('products')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()

    const formatted = products.map((product) => ({
      id: product._id?.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: normalizeImageUrls(product.images || []),
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    return NextResponse.json({ products: formatted })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      mrp,
      category,
      stock,
      images = [],
      colors,
      fragrances,
      isActive = true,
    } = body

    if (!name || !description || price === undefined || !category) {
      return NextResponse.json(
        { error: 'Name, description, price and category are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const now = new Date()
    const product: Product = {
      name,
      description,
      price: Number(price),
      mrp: mrp ? Number(mrp) : undefined,
      category,
      images: normalizeImageUrls(
        Array.isArray(images)
          ? images
          : String(images)
              .split(',')
              .map((img) => img.trim())
              .filter(Boolean)
      ),
      stock: Number(stock ?? 0),
      colors: colors && Array.isArray(colors) && colors.length > 0 ? colors : undefined,
      fragrances: fragrances && Array.isArray(fragrances) && fragrances.length > 0 ? fragrances : undefined,
      createdBy: auth.payload!.userId as any,
      createdAt: now,
      updatedAt: now,
      isActive: Boolean(isActive),
    }

    const result = await db.collection<Product>('products').insertOne(product)

    return NextResponse.json(
      {
        product: {
          id: result.insertedId.toString(),
          ...product,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

