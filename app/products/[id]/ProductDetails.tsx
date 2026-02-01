'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Product } from '@/lib/models/Product'

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Details</h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 md:px-5 pb-4 md:pb-5">
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  )
}



