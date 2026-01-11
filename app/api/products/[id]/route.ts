import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/products'
import { normalizeImageUrls } from '@/lib/images'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Convert ObjectId to string for JSON serialization
    const productResponse = {
      _id: product._id?.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: normalizeImageUrls(product.images || []),
      stock: product.stock,
      isActive: product.isActive,
      colors: product.colors,
      fragrances: product.fragrances,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return NextResponse.json(productResponse)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
