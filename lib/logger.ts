/**
 * Centralized logging utility
 * 
 * Provides structured logging with different log levels and environment-aware behavior.
 * In production, only WARN and ERROR logs are shown. DEBUG logs are only in development.
 * 
 * Security considerations:
 * - Never log sensitive data (passwords, tokens, credit card numbers, etc.)
 * - Sanitize user input before logging
 * - Use appropriate log levels
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Get a safe error message for API responses
 * In development, returns detailed error messages
 * In production, returns generic error messages to prevent information disclosure
 * 
 * @param genericMessage - Generic error message for production
 * @param detailedMessage - Detailed error message for development (optional)
 * @returns Safe error message based on environment
 */
export function getSafeErrorMessage(genericMessage: string, detailedMessage?: string): string {
  if (isDevelopment && detailedMessage) {
    return detailedMessage
  }
  return genericMessage
}

/**
 * Sanitize data before logging to prevent sensitive information leakage
 */
function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'creditCard',
    'cvv',
    'ssn',
    'apiKey',
    'accessToken',
    'refreshToken',
  ]

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item))
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

export const logger = {
  /**
   * Debug logs - only shown in development
   * Use for detailed debugging information
   */
  debug: (...args: any[]): void => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args.map(sanitizeData))
    }
  },

  /**
   * Info logs - shown in all environments
   * Use for general informational messages
   */
  info: (...args: any[]): void => {
    console.log('[INFO]', ...args.map(sanitizeData))
  },

  /**
   * Warning logs - shown in all environments
   * Use for warnings that don't break functionality
   */
  warn: (...args: any[]): void => {
    console.warn('[WARN]', ...args.map(sanitizeData))
  },

  /**
   * Error logs - shown in all environments
   * Use for errors that need attention
   * In production, these should be sent to error tracking service
   */
  error: (...args: any[]): void => {
    console.error('[ERROR]', ...args.map(sanitizeData))
    
    // In production, send to error tracking service (Sentry, etc.)
    // Example:
    // if (isProduction && typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(args[0])
    // }
  },
}
