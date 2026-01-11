import { NextRequest, NextResponse } from 'next/server'

// Mock delivery data - In production, this would query a shipping service API
const DELIVERY_DATA: Record<string, { days: string; available: boolean }> = {
  '110001': { days: '3-5 Days', available: true },
  '400001': { days: '4-6 Days', available: true },
  '560001': { days: '5-7 Days', available: true },
  '700001': { days: '4-6 Days', available: true },
  '600001': { days: '3-5 Days', available: true },
}

const FREE_DELIVERY_THRESHOLD = 500

export async function POST(request: NextRequest) {
  try {
    const { pincode, amount } = await request.json()

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit pincode' },
        { status: 400 }
      )
    }

    // Check if delivery is available for this pincode
    const deliveryInfo = DELIVERY_DATA[pincode] || {
      days: '5-7 Days',
      available: true, // Default to available, can be made more sophisticated
    }

    if (!deliveryInfo.available) {
      return NextResponse.json({
        available: false,
        message: 'Delivery not available for this pincode',
      })
    }

    const freeDelivery = amount >= FREE_DELIVERY_THRESHOLD

    return NextResponse.json({
      available: true,
      days: deliveryInfo.days,
      freeDelivery,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    })
  } catch (error) {
    console.error('Delivery check error:', error)
    return NextResponse.json(
      { error: 'Failed to check delivery' },
      { status: 500 }
    )
  }
}



