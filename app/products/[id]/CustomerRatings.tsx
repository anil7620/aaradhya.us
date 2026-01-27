'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CustomerRatingsProps {
  productId: string
}

interface ReviewData {
  reviews: any[]
  averageRating: number
  totalReviews: number
  ratingCounts: { [key: number]: number }
  ratingPercentages: { [key: number]: number }
}

export default function CustomerRatings({ productId }: CustomerRatingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/reviews`)
        if (res.ok) {
          const data = await res.json()
          setReviewData(data)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  const handleWriteReview = () => {
    // Check if user is logged in
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      router.push('/login')
      return
    }

    // Open review modal or navigate to review page
    // For now, we'll just show an alert
    alert('Review functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <p className="text-gray-600">Loading ratings...</p>
      </div>
    )
  }

  const totalReviews = reviewData?.totalReviews ?? 0
  const ratingPercentages: Record<number, number> =
    reviewData?.ratingPercentages ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8">Customer Ratings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Side - Write Review */}
        <div className="flex flex-col items-center justify-center text-center py-8 md:py-12">
          {totalReviews === 0 ? (
            <>
              <p className="text-gray-700 mb-4 md:mb-6">
                Be the first customer to write a review!
              </p>
              <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
                Share your thoughts with others.
              </p>
              <button
                onClick={handleWriteReview}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
              >
                Write a Review
              </button>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(reviewData!.averageRating)
                        ? 'fill-beige text-beige'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {reviewData!.averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
              <button
                onClick={handleWriteReview}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Rating Breakdown */}
        <div className="space-y-3 md:space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium text-gray-700">{rating} star</span>
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-beige transition-all duration-300"
                  style={{ width: `${ratingPercentages[rating] || 0}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {ratingPercentages[rating]?.toFixed(0) || 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

