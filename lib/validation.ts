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
