'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  productName: string
  productId: string
}

export default function ShareButton({ productName, productId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Get the current URL
    const productUrl = typeof window !== 'undefined' 
      ? window.location.href 
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://aaradhya.us'}/products/${productId}`

    try {
      // Try using the Web Share API first (mobile-friendly)
      if (navigator.share) {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on Aaradhya`,
          url: productUrl,
        })
        return
      }

      // Fallback to clipboard copy
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // If Web Share API is cancelled or fails, fallback to clipboard
      if (error instanceof Error && error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(productUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError)
        }
      }
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 border border-gray-200 hover:border-primary relative"
      aria-label="Share product"
      title={copied ? 'Link copied!' : 'Share product'}
    >
      {copied ? (
        <Check className="w-4 h-4 md:w-5 text-green-600" />
      ) : (
        <Share2 className="w-4 h-4 md:w-5 text-gray-600" />
      )}
    </button>
  )
}
