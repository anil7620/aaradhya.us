/**
 * GST (Goods and Services Tax) Calculation for India
 * 
 * GST rates are uniform across all states in India.
 * Rates are based on product categories, not shipping location.
 * 
 * Common GST Rates:
 * - 0%: Essential items (some food items, books)
 * - 5%: Essential items (some food items, medicines)
 * - 12%: Processed foods, computers, some services
 * - 18%: Most goods and services (most common rate)
 * - 28%: Luxury items, cars, tobacco, etc.
 */

export interface TaxBreakdown {
  baseAmount: number
  gstRate: number // Percentage (e.g., 18 for 18%)
  gstAmount: number
  totalAmount: number
}

/**
 * Default GST rates by product category
 * You can customize these based on your product categories
 */
const DEFAULT_GST_RATES: Record<string, number> = {
  // Puja Items - typically 18% GST
  puja: 18,
  'puja-items': 18,
  'puja-accessories': 18,
  
  // Brass Products - typically 18% GST
  brass: 18,
  'brass-products': 18,
  
  // Idols & Statues - typically 18% GST
  idols: 18,
  statues: 18,
  
  // Handmade items - typically 18% GST
  handmade: 18,
  
  // Default rate for unknown categories
  default: 18,
}

/**
 * Calculate GST for a given amount and category
 */
export function calculateGST(
  baseAmount: number,
  category: string,
  customGSTRate?: number
): TaxBreakdown {
  // Use custom rate if provided, otherwise lookup by category
  const gstRate = customGSTRate ?? getGSTRateByCategory(category)
  
  // Calculate GST amount
  const gstAmount = (baseAmount * gstRate) / 100
  
  // Total amount including GST
  const totalAmount = baseAmount + gstAmount

  return {
    baseAmount,
    gstRate,
    gstAmount: Math.round(gstAmount * 100) / 100, // Round to 2 decimal places
    totalAmount: Math.round(totalAmount * 100) / 100,
  }
}

/**
 * Get GST rate for a product category
 */
export function getGSTRateByCategory(category: string): number {
  // Normalize category name (lowercase, remove spaces)
  const normalizedCategory = category.toLowerCase().trim()
  
  // Check if exact match exists
  if (DEFAULT_GST_RATES[normalizedCategory]) {
    return DEFAULT_GST_RATES[normalizedCategory]
  }
  
  // Check for partial match (e.g., "puja items" matches "puja")
  for (const [key, rate] of Object.entries(DEFAULT_GST_RATES)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return rate
    }
  }
  
  // Return default rate
  return DEFAULT_GST_RATES.default
}

/**
 * Calculate GST for multiple items
 */
export function calculateGSTForItems(
  items: Array<{ price: number; quantity: number; category: string }>,
  customGSTRates?: Record<string, number>
): {
  subtotal: number
  gstAmount: number
  totalAmount: number
  breakdown: Array<{
    category: string
    gstRate: number
    itemSubtotal: number
    itemGST: number
  }>
} {
  let subtotal = 0
  let gstAmount = 0
  const breakdown: Array<{
    category: string
    gstRate: number
    itemSubtotal: number
    itemGST: number
  }> = []

  for (const item of items) {
    const itemSubtotal = item.price * item.quantity
    const gstRate = customGSTRates?.[item.category] ?? getGSTRateByCategory(item.category)
    const itemGST = (itemSubtotal * gstRate) / 100

    subtotal += itemSubtotal
    gstAmount += itemGST

    breakdown.push({
      category: item.category,
      gstRate,
      itemSubtotal,
      itemGST: Math.round(itemGST * 100) / 100,
    })
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round((subtotal + gstAmount) * 100) / 100,
    breakdown,
  }
}

/**
 * Format GST rate for display
 */
export function formatGSTRate(rate: number): string {
  return `${rate}% GST`
}
