'use client'

import { useState, useEffect } from 'react'
import ProductOptions from './ProductOptions'
import ProductActions from './ProductActions'

interface ProductSelectionProps {
  productId: string
  stock: number
  price: number
  colors?: { name: string; hex?: string }[]
  fragrances?: string[]
}

export default function ProductSelection({
  productId,
  stock,
  price,
  colors = [],
  fragrances = [],
}: ProductSelectionProps) {
  // Set default selections - first color and first fragrance
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length > 0 ? colors[0].name : null
  )
  const [selectedFragrance, setSelectedFragrance] = useState<string>(
    fragrances.length > 0 ? fragrances[0] : ''
  )

  // Update defaults when props change (in case they load asynchronously)
  useEffect(() => {
    if (colors.length > 0 && selectedColor === null) {
      setSelectedColor(colors[0].name)
    }
    if (fragrances.length > 0 && selectedFragrance === '') {
      setSelectedFragrance(fragrances[0])
    }
  }, [colors, fragrances, selectedColor, selectedFragrance])

  // Validation: Check if required selections are made
  const isValid = () => {
    // If colors exist, one must be selected
    if (colors.length > 0 && !selectedColor) {
      return false
    }
    // If fragrances exist, one must be selected
    if (fragrances.length > 0 && !selectedFragrance) {
      return false
    }
    return true
  }

  return (
    <>
      <ProductOptions
        colors={colors}
        fragrances={fragrances}
        selectedColor={selectedColor}
        selectedFragrance={selectedFragrance}
        onColorChange={setSelectedColor}
        onFragranceChange={setSelectedFragrance}
      />
      <ProductActions
        productId={productId}
        stock={stock}
        price={price}
        selectedColor={selectedColor}
        selectedFragrance={selectedFragrance}
        isValid={isValid()}
      />
    </>
  )
}
