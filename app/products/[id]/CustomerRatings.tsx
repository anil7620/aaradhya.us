'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'
import ReviewModal from './ReviewModal'

interface CustomerRatingsProps {
  productId: string
}

interface Review {
  _id?: string
  userId: string
  userName: string
  rating: number
  comment?: string
  createdAt: string
}

interface ReviewData {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  ratingCounts: { [key: number]: number }
  ratingPercentages: { [key: number]: number }
  hasPurchased?: boolean
}

export default function CustomerRatings({ productId }: CustomerRatingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)

  const fetchReviews = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`/api/products/${productId}/reviews`, {
        headers,
      })
      
      if (res.ok) {
        const data = await res.json()
        setReviewData(data)
        
        // Check if user has already reviewed
        const currentUser = getCurrentUser()
        if (currentUser?.userId) {
          const userReview = data.reviews?.find(
            (r: Review) => r.userId === currentUser.userId || r.userId?.toString() === currentUser.userId.toString()
          )
          setUserReview(userReview || null)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const handleWriteReview = () => {
    // Check if user is logged in
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    // Check if user has purchased
    if (!reviewData?.hasPurchased) {
      alert('You must purchase this product before writing a review. Please complete a purchase first.')
      return
    }

    setShowReviewModal(true)
  }

  const handleReviewSuccess = () => {
    fetchReviews()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5">
        <p className="text-gray-600">Loading ratings...</p>
      </div>
    )
  }

  const totalReviews = reviewData?.totalReviews ?? 0
  const ratingPercentages: Record<number, number> =
    reviewData?.ratingPercentages ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const reviews = reviewData?.reviews || []

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-5">Customer Ratings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Left Side - Write Review */}
          <div className="flex flex-col items-center justify-center text-center py-4 md:py-6">
          {totalReviews === 0 ? (
            <>
              <p className="text-sm md:text-base text-gray-700 mb-3">
                Be the first customer to write a review!
              </p>
              <p className="text-xs md:text-sm text-gray-500 mb-4">
                Share your thoughts with others.
              </p>
              {reviewData?.hasPurchased && (
                <button
                  onClick={handleWriteReview}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] text-sm"
                >
                  Write a Review
                </button>
              )}
            </>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(reviewData!.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {reviewData!.averageRating.toFixed(1)}
              </p>
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
              {reviewData?.hasPurchased && (
                <button
                  onClick={handleWriteReview}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] text-sm"
                >
                  {userReview ? 'Edit Your Review' : 'Write a Review'}
                </button>
              )}
            </div>
          )}
          </div>

          {/* Right Side - Rating Breakdown */}
          <div className="space-y-2 md:space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-xs md:text-sm font-medium text-gray-700">{rating} star</span>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${ratingPercentages[rating] || 0}%` }}
                  />
                </div>
                <span className="text-xs md:text-sm text-gray-600 w-12 text-right">
                  {ratingPercentages[rating]?.toFixed(0) || 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="border-t border-gray-200 pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Customer Reviews ({reviews.length})
            </h3>
            <div className="space-y-4 md:space-y-6">
              {reviews
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm md:text-base text-gray-900">
                            {review.userName}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <ReviewModal
        productId={productId}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
        existingReview={userReview ? {
          rating: userReview.rating,
          comment: userReview.comment,
        } : undefined}
      />
    </>
  )
}

