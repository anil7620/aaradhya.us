import { ObjectId } from 'mongodb'

/**
 * Validates and converts a string to a MongoDB ObjectId
 * 
 * This function provides consistent validation across all API routes to prevent:
 * - NoSQL injection attempts
 * - Invalid ObjectId errors
 * - Information leakage through error messages
 * 
 * @param id - String to validate and convert
 * @returns ObjectId if valid, null otherwise
 * 
 * @example
 * ```typescript
 * const productId = validateObjectId(params.id)
 * if (!productId) {
 *   return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
 * }
 * ```
 */
export function validateObjectId(id: string | null | undefined): ObjectId | null {
  if (!id || typeof id !== 'string') {
    return null
  }
  
  // Trim whitespace
  const trimmedId = id.trim()
  
  // Check if empty after trimming
  if (!trimmedId) {
    return null
  }
  
  // Validate ObjectId format
  if (!ObjectId.isValid(trimmedId)) {
    return null
  }
  
  // Return validated ObjectId
  return new ObjectId(trimmedId)
}

/**
 * Escapes special regex characters in a string to prevent NoSQL injection
 * 
 * This function escapes regex special characters so that user input can be safely
 * used in MongoDB $regex queries without allowing regex injection attacks.
 * 
 * @param str - String to escape
 * @returns Escaped string safe for use in $regex queries
 * 
 * @example
 * ```typescript
 * const searchTerm = escapeRegex(userInput)
 * query.$or = [
 *   { name: { $regex: searchTerm, $options: 'i' } }
 * ]
 * ```
 */
export function escapeRegex(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  // Escape special regex characters: . * + ? ^ $ { } [ ] | ( ) \
  return str.replace(/[.*+?^${}()[\]\\]/g, '\\$&')
}

/**
 * Sanitizes a string for use in MongoDB queries
 * 
 * Removes or escapes potentially dangerous characters and limits length
 * 
 * @param str - String to sanitize
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized string
 */
export function sanitizeString(str: string, maxLength: number = 100): string {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  // Trim and limit length
  let sanitized = str.trim().substring(0, maxLength)
  
  // Remove null bytes and other control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}
