'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const PLACEHOLDER_IMAGE = '/logos/coming-soon.png'

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
      setHasError(false)
    }
  }, [src])

  // Handle image load error by switching to placeholder
  const handleError = () => {
    if (!hasError && imgSrc !== PLACEHOLDER_IMAGE) {
      setHasError(true)
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }

  const isPlaceholder = imgSrc === PLACEHOLDER_IMAGE || hasError || !src

  // Use regular img tag for better error handling, wrapped to maintain layout
  if (fill) {
    return (
      <div className="absolute inset-0" style={{ backgroundColor: isPlaceholder ? '#faf9f6' : 'transparent' }}>
        <img
          src={isPlaceholder ? PLACEHOLDER_IMAGE : imgSrc}
          alt={alt}
          className={className}
          onError={handleError}
          style={{ 
            objectFit: isPlaceholder ? 'contain' : 'cover', 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: isPlaceholder ? '#faf9f6' : 'transparent', width, height, position: 'relative' }}>
      <img
        src={isPlaceholder ? PLACEHOLDER_IMAGE : imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        style={{
          objectFit: isPlaceholder ? 'contain' : 'cover',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
