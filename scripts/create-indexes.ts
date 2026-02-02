/**
 * Database Index Creation Script
 * 
 * Run this script to create performance indexes on MongoDB collections.
 * 
 * Usage:
 *   npx tsx scripts/create-indexes.ts
 * 
 * Or connect to MongoDB and run the commands manually.
 */

import clientPromise from '../lib/mongodb'

async function createIndexes() {
  try {
    const client = await clientPromise
    const db = client.db()

    console.log('Creating database indexes...')

    // Products collection indexes
    console.log('Creating products indexes...')
    await db.collection('products').createIndex({ isActive: 1, category: 1 })
    await db.collection('products').createIndex({ createdAt: -1 })
    await db.collection('products').createIndex({ name: 'text', description: 'text' }) // Text search
    await db.collection('products').createIndex({ isFeatured: 1 })
    console.log('✓ Products indexes created')

    // Orders collection indexes
    console.log('Creating orders indexes...')
    await db.collection('orders').createIndex({ customerId: 1, createdAt: -1 })
    await db.collection('orders').createIndex({ status: 1, createdAt: -1 })
    await db.collection('orders').createIndex({ 'guestInfo.email': 1 })
    await db.collection('orders').createIndex({ createdAt: -1 })
    console.log('✓ Orders indexes created')

    // Users collection indexes
    console.log('Creating users indexes...')
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ role: 1 })
    console.log('✓ Users indexes created')

    // Categories collection indexes
    console.log('Creating categories indexes...')
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true })
    await db.collection('categories').createIndex({ createdAt: -1 })
    console.log('✓ Categories indexes created')

    // Carts collection indexes
    console.log('Creating carts indexes...')
    await db.collection('carts').createIndex({ userId: 1 }, { unique: true })
    console.log('✓ Carts indexes created')

    // Wishlist collection indexes
    console.log('Creating wishlist indexes...')
    await db.collection('wishlists').createIndex({ userId: 1 }, { unique: true })
    await db.collection('wishlists').createIndex({ 'items.productId': 1 })
    console.log('✓ Wishlist indexes created')

    // Addresses collection indexes
    console.log('Creating addresses indexes...')
    await db.collection('addresses').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('addresses').createIndex({ userId: 1, isDefault: 1 })
    console.log('✓ Addresses indexes created')

    console.log('\n✅ All indexes created successfully!')
    console.log('\nPerformance improvements:')
    console.log('- Faster product queries by category and active status')
    console.log('- Faster order lookups by customer and status')
    console.log('- Faster user authentication by email')
    console.log('- Faster category lookups by slug')
    console.log('- Optimized text search on products')

    process.exit(0)
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()
