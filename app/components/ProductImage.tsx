'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const PLACEHOLDER_IMAGE = 'https://castlewoodassistedliving.com/wp-content/uploads/2021/01/image-coming-soon-placeholder.png'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

export default function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || PLACEHOLDER_IMAGE)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset when src changes
    if (src) {
      setImgSrc(src)
      setHasError(false)
    } else {
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }, [src])

  // Handle image load error by switching to placeholder
  const handleError = () => {
    if (!hasError && imgSrc !== PLACEHOLDER_IMAGE) {
      setHasError(true)
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }

  // Use regular img tag for better error handling, wrapped to maintain layout
  if (fill) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        style={{ 
          objectFit: 'cover', 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          inset: 0
        }}
      />
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
}
