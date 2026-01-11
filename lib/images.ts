/**
 * Image URL utilities for consistent storage and retrieval
 * 
 * Standard format:
 * - S3 URLs: https://bucket.s3.region.amazonaws.com/products/{filename}
 * - Legacy local paths: /uploads/products/{filename} (for backward compatibility)
 */

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'aaradhyai-in-production'
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1'
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`

/**
 * Normalize image URL to ensure consistent format
 * - Converts relative paths to full URLs if needed
 * - Validates URL format
 * - Returns null for invalid URLs
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  
  const trimmed = url.trim()
  if (!trimmed) return null

  // Already a full URL (http/https)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Legacy local path - keep as is for backward compatibility
  // These will need to be migrated to S3 or handled separately
  if (trimmed.startsWith('/uploads/')) {
    return trimmed
  }

  // If it's just a filename, assume it's an S3 key and construct full URL
  // This handles cases where only the key was stored
  if (!trimmed.includes('/') && !trimmed.startsWith('http')) {
    return `${S3_BASE_URL}/products/${trimmed}`
  }

  return trimmed
}

/**
 * Normalize an array of image URLs
 */
export function normalizeImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls
    .map(normalizeImageUrl)
    .filter((url): url is string => url !== null)
}

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  const trimmed = url.trim()
  if (!trimmed) return false

  // Check if it's a valid URL format
  try {
    // Full URL validation
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      new URL(trimmed)
      return true
    }
    
    // Local path validation
    if (trimmed.startsWith('/')) {
      return true
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Get the S3 key from a full S3 URL
 * Example: https://bucket.s3.region.amazonaws.com/products/image.jpg -> products/image.jpg
 */
export function getS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1)
  } catch {
    return null
  }
}

/**
 * Check if a URL is an S3 URL
 */
export function isS3Url(url: string): boolean {
  return url.includes('.s3.') && url.includes('.amazonaws.com')
}

/**
 * Check if a URL is a legacy local path
 */
export function isLegacyLocalPath(url: string): boolean {
  return url.startsWith('/uploads/')
}
