'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CustomerReview } from '@/types'

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<CustomerReview[]>([])

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (data) setReviews(data)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ))
  }

  const getReviewTag = (index: number) => {
    const tags = ['BEST', 'HOT', 'NEW']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-green-500']
    
    return {
      text: tags[index % tags.length],
      color: colors[index % colors.length]
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            엔텔레콤을 이용해보신 고객님의 ❤️
          </h2>
          <p className="text-lg text-gray-600">
            고객님의 소중한 후기 📝
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => {
            const tag = getReviewTag(index)
            
            return (
              <div key={review.id} className="review-card relative">
                {/* 태그 */}
                <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-white text-sm font-bold ${tag.color}`}>
                  {tag.text}
                </div>

                {/* 별점 */}
                <div className="flex justify-center mb-4 mt-2">
                  {renderStars(review.rating)}
                </div>

                {/* 리뷰 내용 */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6 text-center">
                  {review.review_text}
                </p>

                {/* 고객명 */}
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {review.customer_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    고객님
                  </p>
                </div>

                {/* 하단 장식 */}
                <div className="flex justify-center mt-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 추가 정보 */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            더 많은 고객 후기를 보고 싶으시다면
          </p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            후기 더보기
          </button>
        </div>
      </div>
    </section>
  )
} 