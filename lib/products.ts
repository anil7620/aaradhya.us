import clientPromise from './mongodb'
import { Product } from './models/Product'
import { ObjectId } from 'mongodb'
import { normalizeImageUrls } from './images'
import { validateObjectId, escapeRegex, sanitizeString } from './validation'

export async function getProducts(options: {
  limit?: number
  category?: string
  search?: string
} = {}) {
  const client = await clientPromise
  const db = client.db()
  
  const query: any = { isActive: true }
  
  if (options.category) {
    query.category = options.category
  }
  
  if (options.search) {
    // Sanitize and escape search term to prevent NoSQL injection
    const sanitizedSearch = sanitizeString(options.search, 200)
    const escapedSearch = escapeRegex(sanitizedSearch)
    
    // Search in name and description (case-insensitive)
    // Using escaped regex to prevent injection attacks
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ]
  }
  
  const products = await db
    .collection<Product>('products')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .toArray()
  
  // Normalize image URLs for all products
  return products.map(product => ({
    ...product,
    images: normalizeImageUrls(product.images || [])
  }))
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = await clientPromise
  const db = client.db()
  
  // Validate ObjectId format
  const productId = validateObjectId(id)
  if (!productId) {
    return null
  }
  
  try {
    const product = await db.collection<Product>('products').findOne({ _id: productId })
    if (!product) return null
    
    // Normalize image URLs
    return {
      ...product,
      images: normalizeImageUrls(product.images || [])
    }
  } catch {
    return null
  }
}

export async function createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const client = await clientPromise
  const db = client.db()
  
  const newProduct: Product = {
    ...product,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db.collection<Product>('products').insertOne(newProduct)
  newProduct._id = result.insertedId
  return newProduct
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const client = await clientPromise
  const db = client.db()
  
  try {
    const result = await db.collection<Product>('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result || null
  } catch {
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = await clientPromise
  const db = client.db()
  
  try {
    const result = await db.collection<Product>('products').deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch {
    return false
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const client = await clientPromise
  const db = client.db()
  
  const products = await db
    .collection<Product>('products')
    .find({ isActive: true, isFeatured: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray()
  
  return products.map(product => ({
    ...product,
    images: normalizeImageUrls(product.images || [])
  }))
}

/**
 * Get trending products (products ordered in the last 30 days)
 */
export async function getTrendingProducts(limit: number = 8): Promise<Product[]> {
  const client = await clientPromise
  const db = client.db()
  
  // Get products that were ordered in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // Aggregate to find products with recent orders
  const trendingProductIds = await db
    .collection('orders')
    .aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['processing', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalQuantity: -1, orderCount: -1 } },
      { $limit: limit }
    ])
    .toArray()
  
  const productIds = trendingProductIds.map(item => item._id).filter(Boolean)
  
  if (productIds.length === 0) {
    // Fallback: return recently created products if no orders
    const products = await db
      .collection<Product>('products')
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return products.map(product => ({
      ...product,
      images: normalizeImageUrls(product.images || [])
    }))
  }
  
  const products = await db
    .collection<Product>('products')
    .find({ 
      _id: { $in: productIds },
      isActive: true 
    })
    .toArray()
  
  // Sort products by the order they appeared in trending results
  const sortedProducts = productIds
    .map(id => products.find(p => p._id?.toString() === id.toString()))
    .filter(Boolean) as Product[]
  
  return sortedProducts.map(product => ({
    ...product,
    images: normalizeImageUrls(product.images || [])
  }))
}

/**
 * Get best sellers (products with highest total quantity sold)
 */
export async function getBestSellers(limit: number = 8): Promise<Product[]> {
  const client = await clientPromise
  const db = client.db()
  
  // Aggregate to find best selling products
  const bestSellerIds = await db
    .collection('orders')
    .aggregate([
      {
        $match: {
          status: { $in: ['processing', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1, orderCount: -1 } },
      { $limit: limit }
    ])
    .toArray()
  
  const productIds = bestSellerIds.map(item => item._id).filter(Boolean)
  
  if (productIds.length === 0) {
    // Fallback: return featured products if no orders
    return getFeaturedProducts(limit)
  }
  
  const products = await db
    .collection<Product>('products')
    .find({ 
      _id: { $in: productIds },
      isActive: true 
    })
    .toArray()
  
  // Sort products by the order they appeared in best seller results
  const sortedProducts = productIds
    .map(id => products.find(p => p._id?.toString() === id.toString()))
    .filter(Boolean) as Product[]
  
  return sortedProducts.map(product => ({
    ...product,
    images: normalizeImageUrls(product.images || [])
  }))
}

/**
 * Get new arrivals (newest products by created_at)
 */
export async function getNewArrivals(limit: number = 8): Promise<Product[]> {
  const client = await clientPromise
  const db = client.db()
  
  const products = await db
    .collection<Product>('products')
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  
  return products.map(product => ({
    ...product,
    images: normalizeImageUrls(product.images || [])
  }))
}

/**
 * Get recommended products (products with isRecommended flag or fallback to featured)
 */
export async function getRecommendedProducts(limit: number = 8): Promise<Product[]> {
  const client = await clientPromise
  const db = client.db()
  
  // First try to get products with isRecommended flag (if it exists in schema)
  const recommended = await db
    .collection<Product>('products')
    .find({ isActive: true, isRecommended: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray()
  
  if (recommended.length > 0) {
    return recommended.map(product => ({
      ...product,
      images: normalizeImageUrls(product.images || [])
    }))
  }
  
  // Fallback to featured products
  return getFeaturedProducts(limit)
}
