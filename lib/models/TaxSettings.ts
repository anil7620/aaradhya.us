import { ObjectId } from 'mongodb'

export interface TaxSettings {
  _id?: ObjectId
  stateCode: string // Two-letter state code (e.g., "CA", "NY")
  stateName: string // Full state name (e.g., "California")
  taxRate: number // Percentage (e.g., 7.25 for 7.25%)
  enabled: boolean // Whether tax is enabled for this state
  notes?: string // Optional notes about the tax rate
  createdAt: Date
  updatedAt: Date
}
