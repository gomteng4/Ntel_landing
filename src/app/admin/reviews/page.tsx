'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CustomerReview } from '@/types'

export default function ReviewsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchReviews()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('sort_order')
      
      if (data) setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (review: CustomerReview) => {
    try {
      if (review.id && review.id !== 'new') {
        const { id, created_at, updated_at, ...updateData } = review
        const { error } = await supabase
          .from('customer_reviews')
          .update(updateData)
          .eq('id', review.id)
        if (error) throw error
      } else {
        const { id, created_at, updated_at, ...insertData } = review
        const { error } = await supabase
          .from('customer_reviews')
          .insert(insertData)
        if (error) throw error
      }
      
      await fetchReviews()
      setShowForm(false)
      setEditingReview(null)
      alert('리뷰가 저장되었습니다!')
    } catch (error) {
      console.error('Error saving review:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchReviews()
      alert('리뷰가 삭제되었습니다!')
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const newReview: CustomerReview = {
    id: 'new',
    customer_name: '',
    rating: 5,
    review_text: '',
    sort_order: reviews.length + 1,
    is_active: true,
    created_at: '',
    updated_at: ''
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

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로딩 중...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← 대시보드
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">고객 리뷰 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingReview(newReview)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              새 리뷰 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm && editingReview && (
          <ReviewForm
            review={editingReview}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingReview(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-center mb-3">
                {renderStars(review.rating)}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-4 text-center">
                {review.review_text}
              </p>

              <div className="text-center mb-4">
                <p className="font-semibold text-gray-900">{review.customer_name}</p>
                <p className="text-sm text-gray-500">고객님</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className={`text-sm ${review.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {review.is_active ? '활성' : '비활성'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingReview(review)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function ReviewForm({ 
  review, 
  onSave, 
  onCancel 
}: { 
  review: CustomerReview
  onSave: (review: CustomerReview) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(review)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {review.id === 'new' ? '새 리뷰 추가' : '리뷰 편집'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">고객명</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="김○○"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4,5].map(rating => (
                <option key={rating} value={rating}>{rating}점</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
          <textarea
            value={formData.review_text}
            onChange={(e) => setFormData({...formData, review_text: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="고객님의 소중한 후기를 입력하세요"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">순서</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center pt-8">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">활성화</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  )
} 