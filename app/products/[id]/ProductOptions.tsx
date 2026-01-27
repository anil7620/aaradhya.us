'use client'

import { useState } from 'react'
import type { Product } from '@/lib/models/Product'

interface ProductOptionsProps {
  colors?: { name: string; hex?: string }[]
  fragrances?: string[]
  selectedColor?: string | null
  selectedFragrance?: string
  onColorChange?: (color: string | null) => void
  onFragranceChange?: (fragrance: string) => void
}

// Helper function to determine text color based on background
function getContrastColor(hex: string): string {
  try {
    if (!hex || !hex.startsWith('#')) return '#000000'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000'
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  } catch {
    return '#000000'
  }
}

export default function ProductOptions({ 
  colors = [], 
  fragrances = [],
  selectedColor: controlledColor,
  selectedFragrance: controlledFragrance,
  onColorChange,
  onFragranceChange,
}: ProductOptionsProps) {
  // Use controlled state if provided, otherwise use local state
  const [localColor, setLocalColor] = useState<string | null>(null)
  const [localFragrance, setLocalFragrance] = useState<string>('')
  
  const selectedColor = controlledColor !== undefined ? controlledColor : localColor
  const selectedFragrance = controlledFragrance !== undefined ? controlledFragrance : localFragrance
  
  const handleColorChange = (color: string) => {
    if (onColorChange) {
      onColorChange(color)
    } else {
      setLocalColor(color)
    }
  }
  
  const handleFragranceChange = (fragrance: string) => {
    if (onFragranceChange) {
      onFragranceChange(fragrance)
    } else {
      setLocalFragrance(fragrance)
    }
  }

  if (colors.length === 0 && fragrances.length === 0) {
    return null
  }

  return (
    <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
      {colors.length > 0 && (
        <div>
          <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3 md:mb-4">
            Select Color
          </label>
          <div className="flex flex-wrap gap-2 md:gap-3 relative z-10">
            {colors.map((color, index) => {
              const isSelected = selectedColor === color.name
              return (
                <button
                  key={`${color.name}-${index}`}
                  type="button"
                  onClick={() => handleColorChange(color.name)}
                  className={`relative z-10 px-4 py-2.5 border-2 rounded-lg transition-all text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 ${
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2 border-primary shadow-md scale-105 bg-opacity-100'
                      : 'border-gray-200 hover:border-primary hover:shadow-sm'
                  }`}
                  style={{
                    ...(color.hex ? { 
                      backgroundColor: isSelected ? color.hex : (color.hex + '80'),
                      color: getContrastColor(color.hex),
                      borderColor: isSelected ? '#577267' : (color.hex || '#e5e7eb')
                    } : {
                      backgroundColor: isSelected ? '#f0f4f2' : 'transparent',
                      borderColor: isSelected ? '#577267' : '#e5e7eb'
                    })
                  }}
                >
                  {color.name}
                  {isSelected && (
                    <span className="ml-2 font-bold">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {fragrances.length > 0 && (
        <div>
          <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3 md:mb-4">
            Select Fragrance
          </label>
          <select 
            value={selectedFragrance}
            onChange={(e) => handleFragranceChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option value="">Choose a fragrance</option>
            {fragrances.map((fragrance, index) => (
              <option key={index} value={fragrance}>
                {fragrance}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

