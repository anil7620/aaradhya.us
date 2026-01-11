/**
 * Script to seed the database with puja items and brass products
 * Run with: npx tsx --env-file=.env.local scripts/seed-data.ts
 */

// Load .env.local file from project root
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

// Verify env is loaded
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env.local')
  console.error('Make sure .env.local exists in the project root with MONGODB_URI set')
  process.exit(1)
}

import clientPromise from '../lib/mongodb'
import { ObjectId } from 'mongodb'
import { Category } from '../lib/models/Category'
import { Product } from '../lib/models/Product'
import bcrypt from 'bcryptjs'

const categories: Omit<Category, '_id'>[] = [
  {
    name: 'Puja Items',
    slug: 'puja',
    description: 'Essential items for daily worship and religious ceremonies',
    icon: '🪔',
    color: '#D4AF37',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Products',
    slug: 'brass',
    description: 'Handcrafted brass items for puja and home decor',
    icon: '🔔',
    color: '#CD7F32',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Puja Accessories',
    slug: 'puja-accessories',
    description: 'Complete puja accessories and sets',
    icon: '🙏',
    color: '#FF9933',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Idols & Statues',
    slug: 'idols',
    description: 'Divine idols and statues for worship',
    icon: '🕉️',
    color: '#8B4513',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const products: Omit<Product, '_id' | 'createdBy'>[] = [
  // Puja Items
  {
    name: 'Premium Brass Diya Set',
    description: 'Set of 5 beautifully crafted brass diyas for daily puja. Handcrafted with traditional designs, perfect for lighting during prayers and festivals.',
    price: 899,
    mrp: 1299,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Agarbatti Incense Sticks - Premium Pack',
    description: 'Premium quality agarbatti incense sticks in assorted fragrances. Long-lasting fragrance perfect for daily puja and meditation.',
    price: 299,
    mrp: 399,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 100,
    fragrances: ['Sandalwood', 'Rose', 'Jasmine', 'Lavender'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Copper Puja Thali',
    description: 'Traditional copper puja thali with compartments for all puja items. Elegant design with intricate patterns, perfect for daily worship.',
    price: 1299,
    mrp: 1799,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Rudraksha Mala - 108 Beads',
    description: 'Authentic Rudraksha mala with 108 beads. Hand-strung with premium quality beads, perfect for meditation and prayers.',
    price: 1999,
    mrp: 2499,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 25,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Camphor (Kapur) - Pure',
    description: 'Pure camphor tablets for aarti. High quality, long-burning camphor perfect for daily puja rituals.',
    price: 149,
    mrp: 199,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 200,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Puja Bell - Brass',
    description: 'Traditional brass puja bell with beautiful engravings. Produces clear, melodious sound perfect for aarti and prayers.',
    price: 599,
    mrp: 799,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 40,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Kumkum & Haldi Set',
    description: 'Premium kumkum (vermilion) and haldi (turmeric) powder set. Pure, natural colors perfect for tilak and puja rituals.',
    price: 249,
    mrp: 349,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 75,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Ghee Lamp (Ghee Diya)',
    description: 'Traditional ghee lamp made of brass. Perfect for lighting during special puja occasions and festivals.',
    price: 449,
    mrp: 599,
    category: 'puja',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 35,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Brass Products
  {
    name: 'Brass Ganesha Idol - Large',
    description: 'Exquisitely crafted brass Lord Ganesha idol. Handmade with intricate details, perfect for home puja room or office desk.',
    price: 3499,
    mrp: 4499,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 15,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Laxmi-Ganesha Set',
    description: 'Beautiful brass idols of Goddess Laxmi and Lord Ganesha. Perfect pair for home worship, brings prosperity and wisdom.',
    price: 4999,
    mrp: 6499,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 12,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Water Pot (Lota)',
    description: 'Traditional brass water pot with lid. Used for offering water during puja. Handcrafted with beautiful designs.',
    price: 799,
    mrp: 1099,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Aarti Plate',
    description: 'Ornate brass aarti plate with handle. Beautifully decorated with traditional motifs, perfect for performing aarti.',
    price: 1299,
    mrp: 1699,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 28,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Kalash (Holy Pot)',
    description: 'Traditional brass kalash with coconut. Used in puja ceremonies and festivals. Handcrafted with intricate designs.',
    price: 1899,
    mrp: 2499,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 20,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Candle Stand',
    description: 'Elegant brass candle stand with traditional design. Perfect for lighting candles during puja and special occasions.',
    price: 999,
    mrp: 1299,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 32,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Incense Holder',
    description: 'Beautiful brass incense holder with intricate carvings. Holds agarbatti sticks securely, perfect for puja room.',
    price: 599,
    mrp: 799,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 38,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Conch Shell (Shankh)',
    description: 'Authentic brass conch shell for puja. Used in religious ceremonies, produces auspicious sound when blown.',
    price: 1499,
    mrp: 1999,
    category: 'brass',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 18,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Puja Accessories
  {
    name: 'Complete Puja Kit',
    description: 'Complete puja kit containing all essential items: diyas, agarbatti, camphor, kumkum, haldi, and more. Perfect for beginners.',
    price: 2499,
    mrp: 3499,
    category: 'puja-accessories',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 25,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Premium Puja Set with Brass Items',
    description: 'Luxury puja set with premium brass items including diyas, aarti plate, bell, and incense holder. Everything you need for daily worship.',
    price: 4999,
    mrp: 6999,
    category: 'puja-accessories',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 15,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Puja Room Decor Set',
    description: 'Beautiful puja room decoration set with brass items, wall hangings, and decorative elements. Transform your puja space.',
    price: 3499,
    mrp: 4999,
    category: 'puja-accessories',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 20,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Idols & Statues
  {
    name: 'Brass Krishna Idol',
    description: 'Beautiful brass Lord Krishna idol playing flute. Exquisite craftsmanship, perfect for worship and home decor.',
    price: 2999,
    mrp: 3999,
    category: 'idols',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Shiva Lingam',
    description: 'Sacred brass Shiva Lingam with base. Traditional design, perfect for Shiva puja and meditation.',
    price: 2299,
    mrp: 2999,
    category: 'idols',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 14,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Durga Idol',
    description: 'Magnificent brass Goddess Durga idol. Handcrafted with attention to detail, perfect for Navratri and daily worship.',
    price: 3999,
    mrp: 5499,
    category: 'idols',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Brass Hanuman Idol',
    description: 'Powerful brass Lord Hanuman idol. Symbol of strength and devotion, perfect for home puja and office desk.',
    price: 1799,
    mrp: 2499,
    category: 'idols',
    images: [
      'https://images.unsplash.com/photo-1601370690183-1c7796ecec78?w=800&q=80',
    ],
    stock: 16,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedData() {
  try {
    const client = await clientPromise
    const db = client.db()

    console.log('🌱 Starting seed data process...\n')

    // Get or create an admin user for product creation
    let adminUser = await db.collection('users').findOne({ role: 'admin' })
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating a default admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const adminResult = await db.collection('users').insertOne({
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        email: 'admin@aaradhya.us',
        password: hashedPassword,
        role: 'admin',
        acceptTerms: true,
        joinPromotions: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      adminUser = await db.collection('users').findOne({ _id: adminResult.insertedId })
      console.log('✅ Default admin user created (email: admin@aaradhya.us, password: admin123)\n')
    }

    const adminId = adminUser!._id as ObjectId

    // Seed Categories
    console.log('📁 Seeding categories...')
    const categoryOperations = categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $set: category },
        upsert: true,
      },
    }))

    const categoryResult = await db.collection<Category>('categories').bulkWrite(categoryOperations)
    console.log(`✅ Created/Updated ${categoryResult.upsertedCount + categoryResult.modifiedCount} categories\n`)

    // Seed Products
    console.log('🛍️  Seeding products...')
    const productsWithAdmin = products.map((product) => ({
      ...product,
      createdBy: adminId,
    }))

    const productOperations = productsWithAdmin.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true,
      },
    }))

    const productResult = await db.collection<Product>('products').bulkWrite(productOperations)
    console.log(`✅ Created/Updated ${productResult.upsertedCount + productResult.modifiedCount} products\n`)

    // Summary
    console.log('📊 Seed Summary:')
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Products: ${products.length}`)
    console.log('\n✨ Seed data process completed successfully!')
    console.log('\n💡 Note: Product images are using placeholder URLs.')
    console.log('   You can update them with actual product images through the admin panel.\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
