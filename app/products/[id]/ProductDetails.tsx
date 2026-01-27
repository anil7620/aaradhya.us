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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 md:mb-12">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Details</h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  )
}



