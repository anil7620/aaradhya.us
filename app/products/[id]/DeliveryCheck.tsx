'use client'

import { useState } from 'react'
import { Check, Truck, ShoppingCart, Pencil } from 'lucide-react'

interface DeliveryCheckProps {
  productPrice: number
}

export default function DeliveryCheck({ productPrice }: DeliveryCheckProps) {
  const [pincode, setPincode] = useState('')
  const [editing, setEditing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<{
    available: boolean
    days?: string
    freeDelivery?: boolean
  } | null>(null)

  const handleCheckDelivery = async () => {
    if (pincode.length !== 6) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/delivery/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pincode, amount: productPrice }),
      })

      const data = await res.json()

      if (res.ok && data.available) {
        setDeliveryInfo(data)
        setEditing(false)
      } else {
        setDeliveryInfo({ available: false })
      }
    } catch (error) {
      console.error('Delivery check error:', error)
      setDeliveryInfo({ available: false })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setDeliveryInfo(null)
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
      
      {editing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setPincode(value)
                if (value.length === 6) {
                  handleCheckDelivery()
                }
              }}
              placeholder="Enter pincode to check delivery"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              maxLength={6}
            />
            <button
              onClick={handleCheckDelivery}
              disabled={pincode.length !== 6 || loading}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-medium">Pincode: {pincode}</span>
            </div>
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          {deliveryInfo?.available && deliveryInfo.days && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Delivered in {deliveryInfo.days}</span>
            </div>
          )}

          {deliveryInfo?.freeDelivery ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="text-sm">Free Delivery on all purchases above ₹500</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">
                Free Delivery on all purchases above ₹500
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

