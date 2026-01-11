/**
 * Script to create an admin user
 * Run with: npx tsx --env-file=.env.local scripts/create-admin.ts <email> <password> [name]
 * 
 * Example: npx tsx --env-file=.env.local scripts/create-admin.ts admin@aaradhya.us admin123 "Admin User"
 */

// Load .env.local file from project root
// Using require ensures it executes before ES module imports are processed
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

// Verify env is loaded
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env.local')
  console.error('Make sure .env.local exists in the project root with MONGODB_URI set')
  process.exit(1)
}

import clientPromise from '../lib/mongodb'
import { createUser } from '../lib/auth'
import { UserRole } from '../lib/models/User'

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const fullName = process.argv[4] || 'Admin User'

  if (!email || !password) {
    console.error('Usage: npx tsx --env-file=.env.local scripts/create-admin.ts <email> <password> [name]')
    process.exit(1)
  }

  try {
    const client = await clientPromise
    const db = client.db()
    
    // Check if user already exists
    const existing = await db.collection('users').findOne({ email })
    if (existing) {
      console.error('User with this email already exists')
      process.exit(1)
    }

    // Split name into first and last name
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || 'Admin'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    // Create admin user
    const user = await createUser(
      firstName,
      lastName,
      email,
      password,
      UserRole.ADMIN,
      undefined, // phoneNumber
      true, // acceptTerms
      false // joinPromotions
    )
    console.log('Admin user created successfully!')
    console.log(`Name: ${user.firstName} ${user.lastName}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()

