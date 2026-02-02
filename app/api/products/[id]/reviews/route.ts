import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { logger } from '@/lib/logger'
import { validateObjectId } from '@/lib/validation'
import { verifyCSRFForRequest } from '@/lib/csrf-middleware'
import { ObjectId } from 'mongodb'
import { Product, ProductReview } from '@/lib/models/Product'
import { Order } from '@/lib/models/Order'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ObjectId format
    const productId = validateObjectId(params.id)
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const product = await db
      .collection<Product>('products')
      .findOne({ _id: productId })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const reviews = product.reviews || []
    
    // Check if user has purchased (if authenticated)
    let hasPurchased = false
    const token = getTokenFromRequest(request)
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        const userId = new ObjectId(payload.userId)
        const purchase = await db
          .collection<Order>('orders')
          .findOne({
            customerId: userId,
            'items.productId': productId,
            'payment.paymentStatus': 'succeeded',
            status: { $nin: ['cancelled'] },
          })
        hasPurchased = !!purchase
      }
    }
    
    // Serialize reviews for client
    const serializedReviews = reviews.map((review) => ({
      _id: review._id?.toString() || review._id,
      userId: review.userId?.toString() || review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt instanceof Date 
        ? review.createdAt.toISOString() 
        : review.createdAt,
    }))
    
    // Calculate rating distribution
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let totalRating = 0
    
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating as keyof typeof ratingCounts]++
        totalRating += review.rating
      }
    })

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
    const totalReviews = reviews.length

    // Calculate percentages
    const ratingPercentages = {
      5: totalReviews > 0 ? (ratingCounts[5] / totalReviews) * 100 : 0,
      4: totalReviews > 0 ? (ratingCounts[4] / totalReviews) * 100 : 0,
      3: totalReviews > 0 ? (ratingCounts[3] / totalReviews) * 100 : 0,
      2: totalReviews > 0 ? (ratingCounts[2] / totalReviews) * 100 : 0,
      1: totalReviews > 0 ? (ratingCounts[1] / totalReviews) * 100 : 0,
    }

    return NextResponse.json({
      reviews: serializedReviews,
      averageRating,
      totalReviews,
      ratingCounts,
      ratingPercentages,
      hasPurchased,
    })
  } catch (error) {
    logger.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSRF Protection
    const csrfError = verifyCSRFForRequest(request)
    if (csrfError) {
      return csrfError
    }

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Get user details
    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate ObjectId format
    const productId = validateObjectId(params.id)
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    // Get product
    const product = await db
      .collection<Product>('products')
      .findOne({ _id: productId })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Verify user has purchased this product
    const userId = new ObjectId(payload.userId)
    const hasPurchased = await db
      .collection<Order>('orders')
      .findOne({
        customerId: userId,
        'items.productId': productId,
        'payment.paymentStatus': 'succeeded',
        status: { $nin: ['cancelled'] },
      })

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'You must purchase this product before writing a review' },
        { status: 403 }
      )
    }

    // Check if user already reviewed
    const existingReview = product.reviews?.find(
      (r) => r.userId.toString() === payload.userId
    )

    const newReview: ProductReview = {
      _id: new ObjectId(),
      userId: new ObjectId(payload.userId),
      userName: user.name || user.firstName || user.email.split('@')[0],
      rating,
      comment: comment || '',
      createdAt: new Date(),
    }

    if (existingReview) {
      // Update existing review
      await db.collection<Product>('products').updateOne(
        { _id: productId },
        {
          $set: {
            'reviews.$[elem].rating': rating,
            'reviews.$[elem].comment': comment || '',
            'reviews.$[elem].createdAt': new Date(),
            updatedAt: new Date(),
          },
        },
        {
          arrayFilters: [{ 'elem.userId': new ObjectId(payload.userId) }],
        }
      )
    } else {
      // Add new review
      await db.collection<Product>('products').updateOne(
        { _id: productId },
        {
          $push: { reviews: newReview },
          $set: { updatedAt: new Date() },
        }
      )
    }

    // Serialize review for response
    const serializedReview = {
      _id: newReview._id?.toString() || newReview._id,
      userId: newReview.userId?.toString() || newReview.userId,
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: newReview.createdAt instanceof Date 
        ? newReview.createdAt.toISOString() 
        : newReview.createdAt,
    }

    return NextResponse.json({ success: true, review: serializedReview })
  } catch (error) {
    logger.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}


