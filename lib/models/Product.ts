import { ObjectId } from 'mongodb'

export type ProductCategory = string

export interface ProductColor {
  name: string
  hex?: string
}

export interface ProductReview {
  _id?: ObjectId
  userId: ObjectId
  userName: string
  rating: number // 1-5
  comment?: string
  createdAt: Date
}

export interface Product {
  _id?: ObjectId
  name: string
  description: string
  price: number
  mrp?: number // Maximum Retail Price
  category: ProductCategory
  images: string[]
  stock: number
  colors?: ProductColor[] // Available colors
  fragrances?: string[] // Available fragrances
  reviews?: ProductReview[] // Customer reviews
  createdBy: ObjectId // Admin who created the product
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

