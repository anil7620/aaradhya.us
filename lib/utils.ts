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
    colors: product.colors,
    fragrances: product.fragrances,
    // Serialize ObjectIds
    createdBy: product.createdBy?.toString() || product.createdBy,
    // Serialize Dates to ISO strings
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    // Serialize reviews if present (nested ObjectIds)
    reviews: product.reviews?.map((review: any) => ({
      _id: review._id?.toString() || review._id,
      userId: review.userId?.toString() || review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
    })),
  }
}

export function serializeProducts(products: any[]) {
  return products.map(serializeProduct)
}
