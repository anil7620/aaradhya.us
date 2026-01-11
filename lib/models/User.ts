import { ObjectId } from 'mongodb'

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export type UserRoleType = UserRole.ADMIN | UserRole.CUSTOMER

export interface User {
  _id?: ObjectId
  firstName: string
  lastName: string
  name: string // Full name (firstName + lastName) for backward compatibility
  email: string
  phoneNumber?: string
  password: string
  role: UserRoleType
  acceptTerms: boolean
  joinPromotions: boolean
  createdAt: Date
  updatedAt: Date
}

