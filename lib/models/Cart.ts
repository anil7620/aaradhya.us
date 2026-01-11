import { ObjectId } from 'mongodb'

export interface CartItem {
  productId: ObjectId
  quantity: number
  price: number
  selectedColor?: string
  selectedFragrance?: string
  addedAt: Date
}

export interface Cart {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt: Date
}

