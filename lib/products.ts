import clientPromise from './mongodb'
import { Product } from './models/Product'
import { ObjectId } from 'mongodb'
import { normalizeImageUrls } from './images'

export async function getProducts(options: {
  limit?: number
  category?: string
} = {}) {
  const client = await clientPromise
  const db = client.db()
  
  const query: any = { isActive: true }
  
  if (options.category) {
    query.category = options.category
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
  
  try {
    const product = await db.collection<Product>('products').findOne({ _id: new ObjectId(id) })
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

