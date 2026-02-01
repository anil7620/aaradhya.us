import { logger } from './logger'

/**
 * US Sales Tax Calculation
 * 
 * Sales tax rates vary by state, county, and city in the USA.
 * This system allows configuration of tax rates by state.
 * 
 * Common Sales Tax Rates (approximate):
 * - 0%: Alaska, Delaware, Montana, New Hampshire, Oregon (no state sales tax)
 * - 2.9% - 7.25%: Most states have state-level sales tax
 * - Additional local taxes may apply (county/city)
 * 
 * For simplicity, we use state-level rates. You can extend this to include
 * county/city rates if needed.
 * 
 * Tax rates are stored in the database (tax_settings collection) and can be
 * managed through the admin panel. Default rates below are used as fallback.
 */

import clientPromise from './mongodb'

export interface TaxBreakdown {
  baseAmount: number
  taxRate: number // Percentage (e.g., 8.5 for 8.5%)
  taxAmount: number
  totalAmount: number
}

export interface StateTaxRate {
  state: string
  stateCode: string // Two-letter state code (e.g., "CA", "NY")
  taxRate: number // Percentage
  enabled: boolean
}

/**
 * Default US state sales tax rates (approximate, update based on your needs)
 * These can be configured in admin panel
 */
const DEFAULT_STATE_TAX_RATES: Record<string, number> = {
  // States with no sales tax
  'AK': 0, // Alaska
  'DE': 0, // Delaware
  'MT': 0, // Montana
  'NH': 0, // New Hampshire
  'OR': 0, // Oregon
  
  // States with sales tax (approximate rates - update as needed)
  'AL': 4.0, // Alabama
  'AR': 6.5, // Arkansas
  'AZ': 5.6, // Arizona
  'CA': 7.25, // California
  'CO': 2.9, // Colorado
  'CT': 6.35, // Connecticut
  'FL': 6.0, // Florida
  'GA': 4.0, // Georgia
  'HI': 4.17, // Hawaii
  'IA': 6.0, // Iowa
  'ID': 6.0, // Idaho
  'IL': 6.25, // Illinois
  'IN': 7.0, // Indiana
  'KS': 6.5, // Kansas
  'KY': 6.0, // Kentucky
  'LA': 4.45, // Louisiana
  'MA': 6.25, // Massachusetts
  'MD': 6.0, // Maryland
  'ME': 5.5, // Maine
  'MI': 6.0, // Michigan
  'MN': 6.875, // Minnesota
  'MO': 4.225, // Missouri
  'MS': 7.0, // Mississippi
  'NC': 4.75, // North Carolina
  'ND': 5.0, // North Dakota
  'NE': 5.5, // Nebraska
  'NJ': 6.625, // New Jersey
  'NM': 5.125, // New Mexico
  'NV': 6.85, // Nevada
  'NY': 4.0, // New York
  'OH': 5.75, // Ohio
  'OK': 4.5, // Oklahoma
  'PA': 6.0, // Pennsylvania
  'RI': 7.0, // Rhode Island
  'SC': 6.0, // South Carolina
  'SD': 4.5, // South Dakota
  'TN': 7.0, // Tennessee
  'TX': 6.25, // Texas
  'UT': 6.1, // Utah
  'VA': 5.3, // Virginia
  'VT': 6.0, // Vermont
  'WA': 6.5, // Washington
  'WI': 5.0, // Wisconsin
  'WV': 6.0, // West Virginia
  'WY': 4.0, // Wyoming
  'DC': 6.0, // District of Columbia
}

/**
 * Get tax rate for a US state from database
 * Falls back to default rates if database is not available
 */
export async function getTaxRateByState(stateCode: string): Promise<number> {
  try {
    const client = await clientPromise
    const db = client.db()
    const normalizedState = stateCode.toUpperCase().trim()
    
    const taxSetting = await db
      .collection('tax_settings')
      .findOne({ stateCode: normalizedState })
    
    if (taxSetting && taxSetting.enabled) {
      return taxSetting.taxRate
    }
    
    // Fallback to default rates if not found in DB
    if (DEFAULT_STATE_TAX_RATES[normalizedState] !== undefined) {
      return DEFAULT_STATE_TAX_RATES[normalizedState]
    }
    
    return 0
  } catch (error) {
    logger.error('Error fetching tax rate from database, using default:', error)
    // Fallback to default rates on error
    const normalizedState = stateCode.toUpperCase().trim()
    if (DEFAULT_STATE_TAX_RATES[normalizedState] !== undefined) {
      return DEFAULT_STATE_TAX_RATES[normalizedState]
    }
    return 0
  }
}

// Synchronous version for backward compatibility (uses defaults)
export function getTaxRateByStateSync(stateCode: string): number {
  const normalizedState = stateCode.toUpperCase().trim()
  if (DEFAULT_STATE_TAX_RATES[normalizedState] !== undefined) {
    return DEFAULT_STATE_TAX_RATES[normalizedState]
  }
  return 0
}

/**
 * Calculate sales tax for a given amount and state
 */
export async function calculateSalesTax(
  baseAmount: number,
  stateCode: string,
  customTaxRate?: number
): Promise<TaxBreakdown> {
  // Use custom rate if provided, otherwise lookup by state
  const taxRate = customTaxRate ?? await getTaxRateByState(stateCode)
  
  // Calculate tax amount
  const taxAmount = (baseAmount * taxRate) / 100
  
  // Total amount including tax
  const totalAmount = baseAmount + taxAmount

  return {
    baseAmount,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
    totalAmount: Math.round(totalAmount * 100) / 100,
  }
}

/**
 * Calculate sales tax for multiple items
 */
export async function calculateTaxForItems(
  items: Array<{ price: number; quantity: number }>,
  stateCode: string,
  customTaxRate?: number
): Promise<{
  subtotal: number
  taxAmount: number
  totalAmount: number
  taxRate: number
}> {
  let subtotal = 0

  // Calculate subtotal
  for (const item of items) {
    subtotal += item.price * item.quantity
  }

  // Get tax rate for state
  const taxRate = customTaxRate ?? await getTaxRateByState(stateCode)
  
  // Calculate tax on total
  const taxAmount = (subtotal * taxRate) / 100
  const totalAmount = subtotal + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    taxRate,
  }
}

/**
 * Format tax rate for display
 */
export function formatTaxRate(rate: number): string {
  if (rate === 0) {
    return 'No tax'
  }
  return `${rate}% Sales Tax`
}

/**
 * Get all US states with their tax rates
 */
export function getAllStateTaxRates(): StateTaxRate[] {
  return Object.entries(DEFAULT_STATE_TAX_RATES).map(([stateCode, rate]) => ({
    state: getStateName(stateCode),
    stateCode,
    taxRate: rate,
    enabled: true,
  }))
}

/**
 * Get state name from state code
 */
function getStateName(stateCode: string): string {
  const stateNames: Record<string, string> = {
    'AK': 'Alaska', 'AL': 'Alabama', 'AR': 'Arkansas', 'AZ': 'Arizona',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DC': 'District of Columbia',
    'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
    'IA': 'Iowa', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'MA': 'Massachusetts',
    'MD': 'Maryland', 'ME': 'Maine', 'MI': 'Michigan', 'MN': 'Minnesota',
    'MO': 'Missouri', 'MS': 'Mississippi', 'MT': 'Montana', 'NC': 'North Carolina',
    'ND': 'North Dakota', 'NE': 'Nebraska', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NV': 'Nevada', 'NY': 'New York', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
    'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
    'UT': 'Utah', 'VA': 'Virginia', 'VT': 'Vermont', 'WA': 'Washington',
    'WI': 'Wisconsin', 'WV': 'West Virginia', 'WY': 'Wyoming',
  }
  return stateNames[stateCode.toUpperCase()] || stateCode
}
