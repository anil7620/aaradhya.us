/**
 * Script to seed the database with US state tax rates
 * Run with: npx tsx --env-file=.env.local scripts/seed-tax-settings.ts
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
import { TaxSettings } from '../lib/models/TaxSettings'

// Default US state sales tax rates (approximate rates - update as needed)
const DEFAULT_STATE_TAX_RATES: Record<string, { rate: number; name: string }> = {
  // States with no sales tax
  'AK': { rate: 0, name: 'Alaska' },
  'DE': { rate: 0, name: 'Delaware' },
  'MT': { rate: 0, name: 'Montana' },
  'NH': { rate: 0, name: 'New Hampshire' },
  'OR': { rate: 0, name: 'Oregon' },
  
  // States with sales tax (approximate rates - update as needed)
  'AL': { rate: 4.0, name: 'Alabama' },
  'AR': { rate: 6.5, name: 'Arkansas' },
  'AZ': { rate: 5.6, name: 'Arizona' },
  'CA': { rate: 7.25, name: 'California' },
  'CO': { rate: 2.9, name: 'Colorado' },
  'CT': { rate: 6.35, name: 'Connecticut' },
  'DC': { rate: 6.0, name: 'District of Columbia' },
  'FL': { rate: 6.0, name: 'Florida' },
  'GA': { rate: 4.0, name: 'Georgia' },
  'HI': { rate: 4.17, name: 'Hawaii' },
  'IA': { rate: 6.0, name: 'Iowa' },
  'ID': { rate: 6.0, name: 'Idaho' },
  'IL': { rate: 6.25, name: 'Illinois' },
  'IN': { rate: 7.0, name: 'Indiana' },
  'KS': { rate: 6.5, name: 'Kansas' },
  'KY': { rate: 6.0, name: 'Kentucky' },
  'LA': { rate: 4.45, name: 'Louisiana' },
  'MA': { rate: 6.25, name: 'Massachusetts' },
  'MD': { rate: 6.0, name: 'Maryland' },
  'ME': { rate: 5.5, name: 'Maine' },
  'MI': { rate: 6.0, name: 'Michigan' },
  'MN': { rate: 6.875, name: 'Minnesota' },
  'MO': { rate: 4.225, name: 'Missouri' },
  'MS': { rate: 7.0, name: 'Mississippi' },
  'NC': { rate: 4.75, name: 'North Carolina' },
  'ND': { rate: 5.0, name: 'North Dakota' },
  'NE': { rate: 5.5, name: 'Nebraska' },
  'NJ': { rate: 6.625, name: 'New Jersey' },
  'NM': { rate: 5.125, name: 'New Mexico' },
  'NV': { rate: 6.85, name: 'Nevada' },
  'NY': { rate: 4.0, name: 'New York' },
  'OH': { rate: 5.75, name: 'Ohio' },
  'OK': { rate: 4.5, name: 'Oklahoma' },
  'PA': { rate: 6.0, name: 'Pennsylvania' },
  'RI': { rate: 7.0, name: 'Rhode Island' },
  'SC': { rate: 6.0, name: 'South Carolina' },
  'SD': { rate: 4.5, name: 'South Dakota' },
  'TN': { rate: 7.0, name: 'Tennessee' },
  'TX': { rate: 6.25, name: 'Texas' },
  'UT': { rate: 6.1, name: 'Utah' },
  'VA': { rate: 5.3, name: 'Virginia' },
  'VT': { rate: 6.0, name: 'Vermont' },
  'WA': { rate: 6.5, name: 'Washington' },
  'WI': { rate: 5.0, name: 'Wisconsin' },
  'WV': { rate: 6.0, name: 'West Virginia' },
  'WY': { rate: 4.0, name: 'Wyoming' },
}

async function seedTaxSettings() {
  try {
    const client = await clientPromise
    const db = client.db()

    console.log('🌱 Starting tax settings seed process...\n')

    // Prepare tax settings
    const taxSettings: Omit<TaxSettings, '_id'>[] = Object.entries(DEFAULT_STATE_TAX_RATES).map(
      ([stateCode, data]) => ({
        stateCode,
        stateName: data.name,
        taxRate: data.rate,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    )

    // Bulk write with upsert
    const operations = taxSettings.map((setting) => ({
      updateOne: {
        filter: { stateCode: setting.stateCode },
        update: { $set: setting },
        upsert: true,
      },
    }))

    const result = await db.collection<TaxSettings>('tax_settings').bulkWrite(operations)

    console.log('📊 Tax Settings Seed Summary:')
    console.log(`   Total states: ${taxSettings.length}`)
    console.log(`   Created: ${result.upsertedCount}`)
    console.log(`   Updated: ${result.modifiedCount}`)
    console.log('\n✨ Tax settings seed completed successfully!')
    console.log('\n💡 Note: Tax rates are approximate. Update them through the admin panel at /admin/tax\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding tax settings:', error)
    process.exit(1)
  }
}

seedTaxSettings()
