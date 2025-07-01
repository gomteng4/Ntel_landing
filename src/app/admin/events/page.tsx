'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { EventBanner } from '@/types'
import ImageUpload from '@/components/ImageUpload'

export default function EventsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)  
  const [eventBanners, setEventBanners] = useState<EventBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBanner, setEditingBanner] = useState<EventBanner | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchEventBanners()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchEventBanners = async () => {
    try {
      const { data } = await supabase
        .from('event_banners')
        .select('*')
        .order('sort_order')
      
      if (data) setEventBanners(data)
    } catch (error) {
      console.error('Error fetching event banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (banner: EventBanner) => {
    try {
      if (banner.id && banner.id !== 'new') {
        const { error } = await supabase
          .from('event_banners')
          .update(banner)
          .eq('id', banner.id)
        if (error) throw error
      } else {
        const { id, ...bannerData } = banner
        const { error } = await supabase
          .from('event_banners')
          .insert(bannerData)
        if (error) throw error
      }
      
      await fetchEventBanners()
      setShowForm(false)
      setEditingBanner(null)
      alert('이벤트 배너가 저장되었습니다!')
    } catch (error) {
      console.error('Error saving event banner:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('event_banners')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchEventBanners()
      alert('이벤트 배너가 삭제되었습니다!')
    } catch (error) {
      console.error('Error deleting event banner:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const newBanner: EventBanner = {
    id: 'new',
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    sort_order: eventBanners.length + 1,
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
              <h1 className="text-2xl font-bold text-gray-900">이벤트 배너 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingBanner(newBanner)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              새 이벤트 배너 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm && editingBanner && (
          <EventBannerForm
            banner={editingBanner}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingBanner(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventBanners.map((banner) => (
                       <div key={banner.id} className="bg-white shadow rounded-lg overflow-hidden">
             {banner.image_url ? (
               <div 
                 className="h-32 bg-center bg-cover relative"
                 style={{ backgroundImage: `url(${banner.image_url})` }}
               >
                 <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white">
                   <div className="text-center">
                     <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                     <p className="text-sm opacity-90">{banner.description}</p>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="h-32 flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
                 <div className="text-center">
                   <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                   <p className="text-sm opacity-90">{banner.description}</p>
                 </div>
               </div>
             )}
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">순서: {banner.sort_order}</span>
                  <span className={`text-sm ${banner.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {banner.is_active ? '활성' : '비활성'}
                  </span>
                </div>
                
                {banner.link_url && (
                  <p className="text-sm text-gray-600 mb-3 truncate">
                    링크: {banner.link_url}
                  </p>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingBanner(banner)
                      setShowForm(true)
                    }}
                    className="flex-1 text-blue-600 hover:text-blue-800 py-2 text-sm font-medium"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex-1 text-red-600 hover:text-red-800 py-2 text-sm font-medium"
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

function EventBannerForm({ 
  banner, 
  onSave, 
  onCancel 
}: { 
  banner: EventBanner
  onSave: (banner: EventBanner) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(banner)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {banner.id === 'new' ? '새 이벤트 배너 추가' : '이벤트 배너 편집'}
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
              placeholder="특별 할인 이벤트"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="지금 가입하면 30% 할인"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이벤트 배너 이미지</label>
          <ImageUpload
            currentImageUrl={formData.image_url}
            onImageUploaded={(url) => setFormData({...formData, image_url: url})}
            folder="events"
            placeholder="이벤트 배너 이미지를 업로드하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">링크 URL</label>
          <input
            type="url"
            value={formData.link_url || ''}
            onChange={(e) => setFormData({...formData, link_url: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/event"
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