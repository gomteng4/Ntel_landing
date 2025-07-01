'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PricingPlan } from '@/types'
import ImageUpload from '@/components/ImageUpload'

export default function PricingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchPricingPlans()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchPricingPlans = async () => {
    try {
      const { data } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order')
      
      if (data) setPricingPlans(data)
    } catch (error) {
      console.error('Error fetching pricing plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (plan: PricingPlan) => {
    try {
      if (plan.id && plan.id !== 'new') {
        const { id, created_at, updated_at, ...updateData } = plan
        const { error } = await supabase
          .from('pricing_plans')
          .update(updateData)
          .eq('id', plan.id)
        if (error) throw error
      } else {
        const { id, created_at, updated_at, ...insertData } = plan
        const { error } = await supabase
          .from('pricing_plans')
          .insert(insertData)
        if (error) throw error
      }
      
      await fetchPricingPlans()
      setShowForm(false)
      setEditingPlan(null)
      alert('요금제가 저장되었습니다!')
    } catch (error) {
      console.error('Error saving pricing plan:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchPricingPlans()
      alert('요금제가 삭제되었습니다!')
    } catch (error) {
      console.error('Error deleting pricing plan:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const newPlan: PricingPlan = {
    id: 'new',
    name: '',
    price: '',
    original_price: '',
    tag: '',
    tag_color: '#ff4757',
    description: '',
    features: [],
    image_url: '',
    sort_order: pricingPlans.length + 1,
    is_active: true,
    created_at: '',
    updated_at: ''
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
              <h1 className="text-2xl font-bold text-gray-900">요금제 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingPlan(newPlan)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              새 요금제 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm && editingPlan && (
          <PricingForm
            plan={editingPlan}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingPlan(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="bg-white shadow rounded-lg p-6 relative">
              {plan.tag && (
                <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-white text-sm font-bold`} style={{backgroundColor: plan.tag_color}}>
                  {plan.tag}
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-2xl font-bold text-red-500 mb-1">{plan.price}</div>
                {plan.original_price && (
                  <div className="text-sm text-gray-500 line-through">{plan.original_price}</div>
                )}
              </div>

              {plan.features && Array.isArray(plan.features) && (
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className={`text-sm ${plan.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {plan.is_active ? '활성' : '비활성'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingPlan(plan)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
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

function PricingForm({ 
  plan, 
  onSave, 
  onCancel 
}: { 
  plan: PricingPlan
  onSave: (plan: PricingPlan) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(plan)
  const [featuresText, setFeaturesText] = useState(
    Array.isArray(plan.features) ? plan.features.join('\n') : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const features = featuresText.split('\n').filter(f => f.trim() !== '')
    onSave({...formData, features})
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {plan.id === 'new' ? '새 요금제 추가' : '요금제 편집'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">요금제명</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="월 21,000원"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">원래 가격</label>
            <input
              type="text"
              value={formData.original_price || ''}
              onChange={(e) => setFormData({...formData, original_price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="월 30,000원"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
            <input
              type="text"
              value={formData.tag || ''}
              onChange={(e) => setFormData({...formData, tag: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="BEST, HOT"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">순서</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">특징 (한 줄에 하나씩)</label>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="음성통화&#10;7GB 데이터&#10;문자무제한"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">요금제 이미지</label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUploaded={(url) => setFormData({...formData, image_url: url})}
              folder="pricing"
              placeholder="요금제 이미지를 업로드하세요"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
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