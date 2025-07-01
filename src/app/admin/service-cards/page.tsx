'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ServiceCard } from '@/types'
import ImageUpload from '@/components/ImageUpload'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export default function ServiceCardsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<ServiceCard | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchServiceCards()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchServiceCards = async () => {
    try {
      const { data } = await supabase
        .from('service_cards')
        .select('*')
        .order('sort_order')
      
      if (data) setServiceCards(data)
    } catch (error) {
      console.error('Error fetching service cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (card: ServiceCard) => {
    try {
      if (card.id && card.id !== 'new') {
        const { error } = await supabase
          .from('service_cards')
          .update(card)
          .eq('id', card.id)
        if (error) throw error
      } else {
        const { id, ...cardData } = card
        const { error } = await supabase
          .from('service_cards')
          .insert(cardData)
        if (error) throw error
      }
      
      await fetchServiceCards()
      setShowForm(false)
      setEditingCard(null)
      alert('서비스 카드가 저장되었습니다!')
    } catch (error) {
      console.error('Error saving service card:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('service_cards')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchServiceCards()
      alert('서비스 카드가 삭제되었습니다!')
    } catch (error) {
      console.error('Error deleting service card:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const newCard: ServiceCard = {
    id: 'new',
    title: '',
    icon_url: '📱',
    sort_order: serviceCards.length + 1,
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
              <h1 className="text-2xl font-bold text-gray-900">서비스 카드 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingCard(newCard)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              새 서비스 카드 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm && editingCard && (
          <ServiceCardForm
            card={editingCard}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingCard(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((card) => (
                         <div key={card.id} className="bg-white shadow rounded-lg p-6 text-center">
               <div className="mb-4">
                 {card.icon_url?.startsWith('http') ? (
                   <img src={card.icon_url} alt={card.title} className="w-16 h-16 mx-auto object-contain" />
                 ) : (
                   <div className="text-4xl">{card.icon_url}</div>
                 )}
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className={`text-sm ${card.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {card.is_active ? '활성' : '비활성'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingCard(card)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
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

function ServiceCardForm({ 
  card, 
  onSave, 
  onCancel 
}: { 
  card: ServiceCard
  onSave: (card: ServiceCard) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(card)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {card.id === 'new' ? '새 서비스 카드 추가' : '서비스 카드 편집'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="개통/개설"
              required
            />
          </div>
                     <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">아이콘 (이미지 또는 이모지)</label>
             <div className="space-y-4">
               <input
                 type="text"
                 value={formData.icon_url || ''}
                 onChange={(e) => setFormData({...formData, icon_url: e.target.value})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="📱 (이모지) 또는 이미지 URL"
               />
               <div className="text-sm text-gray-500">
                 또는 이미지 업로드:
               </div>
               <ImageUpload
                 currentImageUrl={formData.icon_url?.startsWith('http') ? formData.icon_url : ''}
                 onImageUploaded={(url) => setFormData({...formData, icon_url: url})}
                 folder="service-icons"
                 placeholder="서비스 아이콘을 업로드하세요"
               />
             </div>
           </div>
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