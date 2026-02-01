import { NextRequest, NextResponse } from 'next/server'
import { ObjectId, ModifyResult } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/lib/models/Product'
import { verifyToken } from '@/lib/auth'
import { normalizeImageUrls } from '@/lib/images'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { validateObjectId } from '@/lib/validation'
import { logger, getSafeErrorMessage } from '@/lib/logger'

async function requireAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request)
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
    isFeatured: product.isFeatured || false,
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
    // Validate ObjectId format
    const productId = validateObjectId(params.id)
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const product = await db
      .collection<Product>('products')
      .findOne({ _id: productId })

    if (!product) {
      logger.error(`Product not found in database: ${productId}`)
      // In development, log sample IDs for debugging (but don't expose in response)
      if (process.env.NODE_ENV === 'development') {
        const sampleProducts = await db
          .collection<Product>('products')
          .find({})
          .limit(5)
          .toArray()
        logger.debug('Sample product IDs in database:', sampleProducts.map(p => p._id?.toString()))
      }
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
  logger.debug('PUT request received for product ID:', params.id)
  
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    // Validate ObjectId format
    const productId = validateObjectId(params.id)
    if (!productId) {
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
      .findOne({ _id: productId })
    
    if (!existingProduct) {
      logger.error(`Product not found in database: ${productId}`)
      
      // In development, log available IDs for debugging (but don't expose in response)
      let detailedError = 'Product not found'
      if (process.env.NODE_ENV === 'development') {
        const sampleProducts = await db
          .collection<Product>('products')
          .find({})
          .limit(5)
          .toArray()
        const productIds = sampleProducts.map(p => p._id?.toString()).filter(Boolean)
        logger.debug('Available product IDs in database:', productIds)
        detailedError = `Product not found. Available IDs: ${productIds.length > 0 ? productIds.join(', ') : 'none'}`
      }
      
      return NextResponse.json({ 
        error: getSafeErrorMessage('Product not found', detailedError)
      }, { status: 404 })
    }

    // Update the product using updateOne (more reliable than findOneAndUpdate)
    const updateResult = await db
      .collection<Product>('products')
      .updateOne(
        { _id: productId },
        { $set: update }
      )

    if (updateResult.matchedCount === 0) {
      logger.error(`Update matched 0 documents for product: ${productId}`)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch the updated product
    const updatedProduct = await db
      .collection<Product>('products')
      .findOne({ _id: productId })

    if (!updatedProduct) {
      logger.error(`Failed to retrieve updated product: ${productId}`)
      return NextResponse.json({ error: 'Failed to retrieve updated product' }, { status: 500 })
    }

    return NextResponse.json({ product: formatProduct(updatedProduct) })
  } catch (error: any) {
    logger.error('Error updating product:', error)
    // Provide safe error messages (generic in production, detailed in development)
    if (error.message?.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }
    const errorMessage = getSafeErrorMessage(
      'Failed to update product',
      error.message || 'Failed to update product'
    )
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    // Validate ObjectId format
    const productId = validateObjectId(params.id)
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db
      .collection<Product>('products')
      .deleteOne({ _id: productId })

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Error deleting product:', error)
    if (error.message?.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }
    const errorMessage = getSafeErrorMessage(
      'Failed to delete product',
      error.message || 'Failed to delete product'
    )
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


