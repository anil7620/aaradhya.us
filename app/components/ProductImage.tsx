'use client'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Reset when src changes
    if (src) {
      setImgSrc(src)
      setHasError(false)
      setIsLoading(true)
    } else {
      setImgSrc(PLACEHOLDER_IMAGE)
      setHasError(false)
      setIsLoading(true)
    }
  }, [src])

  // Handle image load error by switching to placeholder
  const handleError = () => {
    if (imgSrc !== PLACEHOLDER_IMAGE) {
      // Original image failed, switch to placeholder
      setHasError(true)
      setImgSrc(PLACEHOLDER_IMAGE)
      setIsLoading(true)
    } else {
      // Placeholder also failed - show background color as fallback
      setHasError(true)
      setIsLoading(false)
    }
  }

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false)
  }

  const isPlaceholder = imgSrc === PLACEHOLDER_IMAGE || hasError || !src

  // Use regular img tag for better error handling, wrapped to maintain layout
  if (fill) {
    return (
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundColor: isPlaceholder ? '#faf9f6' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          key={imgSrc}
          src={imgSrc}
          alt={alt}
          className={className}
          onError={handleError}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          style={{ 
            objectFit: isPlaceholder ? 'contain' : 'cover', 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            inset: 0,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
        {isLoading && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#faf9f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div 
      style={{ 
        backgroundColor: isPlaceholder ? '#faf9f6' : 'transparent', 
        width, 
        height, 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        key={imgSrc}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          objectFit: isPlaceholder ? 'contain' : 'cover',
          width: '100%',
          height: '100%',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#faf9f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        />
      )}
    </div>
  )
}
