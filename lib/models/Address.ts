import { ObjectId } from 'mongodb'

export type AddressType = 'HOME' | 'WORK' | 'OTHER'

export interface Address {
  _id?: ObjectId
  userId: ObjectId
  label?: string // e.g., "Home", "Work", "Default"
  type?: AddressType // HOME, WORK, OTHER
  street: string
  city: string
  state: string // 2-letter US state code
  zipCode: string
  country: string
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}
