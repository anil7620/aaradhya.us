import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Serialize MongoDB objects for client components
export function serializeProduct(product: any) {
  return {
    _id: product._id?.toString() || product._id,
    name: product.name,
    price: product.price,
    mrp: product.mrp,
    images: product.images,
    isFeatured: product.isFeatured,
    stock: product.stock,
    category: product.category,
    description: product.description,
    isActive: product.isActive,
  }
}

export function serializeProducts(products: any[]) {
  return products.map(serializeProduct)
}
