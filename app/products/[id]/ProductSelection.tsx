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
  // Normalize to ensure arrays (handle null/undefined)
  const colorsArray = colors || []
  const fragrancesArray = fragrances || []

  // Set default selections - first color and first fragrance
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorsArray.length > 0 ? colorsArray[0].name : null
  )
  const [selectedFragrance, setSelectedFragrance] = useState<string>(
    fragrancesArray.length > 0 ? fragrancesArray[0] : ''
  )

  // Update defaults when props change (in case they load asynchronously)
  useEffect(() => {
    if (colorsArray.length > 0 && selectedColor === null) {
      setSelectedColor(colorsArray[0].name)
    }
    if (fragrancesArray.length > 0 && selectedFragrance === '') {
      setSelectedFragrance(fragrancesArray[0])
    }
  }, [colorsArray, fragrancesArray, selectedColor, selectedFragrance])

  // Validation: Check if required selections are made
  const isValid = () => {
    // If colors exist, one must be selected
    if (colorsArray.length > 0 && !selectedColor) {
      return false
    }
    // If fragrances exist, one must be selected
    if (fragrancesArray.length > 0 && !selectedFragrance) {
      return false
    }
    return true
  }

  return (
    <>
      <ProductOptions
        colors={colorsArray}
        fragrances={fragrancesArray}
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
