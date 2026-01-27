import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { TaxSettings } from '@/lib/models/TaxSettings'

// GET - Get tax rate for a specific state (public API)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateCode = searchParams.get('state')

    if (!stateCode) {
      return NextResponse.json(
        { error: 'State code is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    const normalizedState = stateCode.toUpperCase().trim()
    const taxSetting = await db
      .collection<TaxSettings>('tax_settings')
      .findOne({ stateCode: normalizedState })

    if (!taxSetting || !taxSetting.enabled) {
      return NextResponse.json({
        stateCode: normalizedState,
        taxRate: 0,
        enabled: false,
      })
    }

    return NextResponse.json({
      stateCode: taxSetting.stateCode,
      stateName: taxSetting.stateName,
      taxRate: taxSetting.taxRate,
      enabled: taxSetting.enabled,
    })
  } catch (error) {
    console.error('Error fetching tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax rate' },
      { status: 500 }
    )
  }
}
