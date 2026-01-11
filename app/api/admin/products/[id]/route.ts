import { NextRequest, NextResponse } from 'next/server'
import { ObjectId, ModifyResult } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/lib/models/Product'
import { verifyToken } from '@/lib/auth'
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

function formatProduct(product: Product & { _id?: ObjectId }) {
  return {
    id: product._id?.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    mrp: product.mrp,
    category: product.category,
    // Normalize image URLs to ensure consistent format
    images: normalizeImageUrls(product.images || []),
    stock: product.stock,
    colors: product.colors,
    fragrances: product.fragrances,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const productId = params.id
    console.log('GET request for product ID:', productId)

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      console.error('Invalid ObjectId format:', productId)
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const product = await db
      .collection<Product>('products')
      .findOne({ _id: new ObjectId(productId) })

    if (!product) {
      console.error(`Product not found in database: ${productId}`)
      // List a few product IDs for debugging
      const sampleProducts = await db
        .collection<Product>('products')
        .find({})
        .limit(5)
        .toArray()
      console.log('Sample product IDs in database:', sampleProducts.map(p => p._id?.toString()))
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: formatProduct(product) })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PUT request received for product ID:', params.id)
  
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const productId = params.id

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      console.error('Invalid ObjectId format:', productId)
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

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

    // Normalize and validate image URLs before storing
    const normalizedImages = Array.isArray(images)
      ? normalizeImageUrls(images)
      : String(images)
          .split(',')
          .map((img) => img.trim())
          .filter(Boolean)
          .map((img) => normalizeImageUrls([img])[0])
          .filter(Boolean)

    const update: any = {
      name,
      description,
      price: Number(price),
      category,
      images: normalizedImages,
      stock: Number(stock ?? 0),
      isActive: Boolean(isActive),
      updatedAt: new Date(),
    }

    if (mrp !== undefined) {
      update.mrp = mrp ? Number(mrp) : null
    }
    if (colors !== undefined) {
      update.colors = colors && Array.isArray(colors) && colors.length > 0 ? colors : null
    }
    if (fragrances !== undefined) {
      update.fragrances = fragrances && Array.isArray(fragrances) && fragrances.length > 0 ? fragrances : null
    }

    // First verify the product exists
    const existingProduct = await db
      .collection<Product>('products')
      .findOne({ _id: new ObjectId(productId) })
    
    if (!existingProduct) {
      console.error(`Product not found in database: ${productId}`)
      // List some product IDs for debugging
      const sampleProducts = await db
        .collection<Product>('products')
        .find({})
        .limit(5)
        .toArray()
      const productIds = sampleProducts.map(p => p._id?.toString()).filter(Boolean)
      console.log('Available product IDs in database:', productIds)
      return NextResponse.json({ 
        error: `Product not found. Available IDs: ${productIds.length > 0 ? productIds.join(', ') : 'none'}` 
      }, { status: 404 })
    }

    // Update the product using updateOne (more reliable than findOneAndUpdate)
    const updateResult = await db
      .collection<Product>('products')
      .updateOne(
        { _id: new ObjectId(productId) },
        { $set: update }
      )

    if (updateResult.matchedCount === 0) {
      console.error(`Update matched 0 documents for product: ${productId}`)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch the updated product
    const updatedProduct = await db
      .collection<Product>('products')
      .findOne({ _id: new ObjectId(productId) })

    if (!updatedProduct) {
      console.error(`Failed to retrieve updated product: ${productId}`)
      return NextResponse.json({ error: 'Failed to retrieve updated product' }, { status: 500 })
    }

    return NextResponse.json({ product: formatProduct(updatedProduct) })
  } catch (error: any) {
    console.error('Error updating product:', error)
    // Provide more specific error messages
    if (error.message?.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const productId = params.id

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db
      .collection<Product>('products')
      .deleteOne({ _id: new ObjectId(productId) })

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    if (error.message?.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}


