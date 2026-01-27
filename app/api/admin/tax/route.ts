import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { TaxSettings } from '@/lib/models/TaxSettings'
import { ObjectId } from 'mongodb'

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

// GET - Fetch all tax settings
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const client = await clientPromise
    const db = client.db()
    const taxSettings = await db
      .collection<TaxSettings>('tax_settings')
      .find({})
      .sort({ stateName: 1 })
      .toArray()

    return NextResponse.json({ taxSettings })
  } catch (error) {
    console.error('Error fetching tax settings:', error)
    return NextResponse.json({ error: 'Failed to fetch tax settings' }, { status: 500 })
  }
}

// PUT - Update tax settings (bulk update)
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('response' in auth) return auth.response

  try {
    const body = await request.json()
    const { taxSettings } = body

    if (!Array.isArray(taxSettings)) {
      return NextResponse.json(
        { error: 'taxSettings must be an array' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Validate and prepare updates
    const updates = taxSettings.map((setting: any) => {
      if (!setting.stateCode || typeof setting.taxRate !== 'number' || setting.taxRate < 0 || setting.taxRate > 100) {
        throw new Error(`Invalid tax setting for ${setting.stateCode || 'unknown'}`)
      }

      return {
        updateOne: {
          filter: { stateCode: setting.stateCode.toUpperCase().trim() },
          update: {
            $set: {
              stateCode: setting.stateCode.toUpperCase().trim(),
              stateName: setting.stateName || getStateName(setting.stateCode),
              taxRate: Number(setting.taxRate),
              enabled: setting.enabled !== undefined ? Boolean(setting.enabled) : true,
              notes: setting.notes || undefined,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }
    })

    // Bulk write updates
    const result = await db.collection<TaxSettings>('tax_settings').bulkWrite(updates)

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} tax settings, created ${result.upsertedCount} new settings`,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    })
  } catch (error: any) {
    console.error('Error updating tax settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tax settings' },
      { status: 500 }
    )
  }
}

// Helper function to get state name from code
function getStateName(stateCode: string): string {
  const stateNames: Record<string, string> = {
    'AK': 'Alaska', 'AL': 'Alabama', 'AR': 'Arkansas', 'AZ': 'Arizona',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DC': 'District of Columbia',
    'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
    'IA': 'Iowa', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'MA': 'Massachusetts',
    'MD': 'Maryland', 'ME': 'Maine', 'MI': 'Michigan', 'MN': 'Minnesota',
    'MO': 'Missouri', 'MS': 'Mississippi', 'MT': 'Montana', 'NC': 'North Carolina',
    'ND': 'North Dakota', 'NE': 'Nebraska', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NV': 'Nevada', 'NY': 'New York', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
    'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
    'UT': 'Utah', 'VA': 'Virginia', 'VT': 'Vermont', 'WA': 'Washington',
    'WI': 'Wisconsin', 'WV': 'West Virginia', 'WY': 'Wyoming',
  }
  return stateNames[stateCode.toUpperCase()] || stateCode
}
