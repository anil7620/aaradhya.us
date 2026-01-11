import { ObjectId } from 'mongodb'

export interface Category {
  _id?: ObjectId
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}


