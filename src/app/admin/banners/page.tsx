'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Banner } from '@/types'
import ImageUpload from '@/components/ImageUpload'

export default function BannersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchBanners()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchBanners = async () => {
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order')
      
      if (data) setBanners(data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (banner: Banner) => {
    try {
      if (banner.id && banner.id !== 'new') {
        const { id, created_at, updated_at, ...updateData } = banner
        const { error } = await supabase
          .from('banners')
          .update(updateData)
          .eq('id', banner.id)
        if (error) throw error
      } else {
        const { id, created_at, updated_at, ...insertData } = banner
        const { error } = await supabase
          .from('banners')
          .insert(insertData)
        if (error) throw error
      }
      
      await fetchBanners()
      setShowForm(false)
      setEditingBanner(null)
      alert('배너가 저장되었습니다!')
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchBanners()
      alert('배너가 삭제되었습니다!')
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const newBanner: Banner = {
    id: 'new',
    title: '',
    subtitle: '',
    image_url: '',
    button_text: '',
    button_url: '',
    buttons: [],
    background_color: '#3b82f6',
    sort_order: banners.length + 1,
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
              <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingBanner(newBanner)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              새 배너 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm && editingBanner && (
          <BannerForm
            banner={editingBanner}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingBanner(null)
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white shadow rounded-lg overflow-hidden">
              {banner.image_url && (
                <div 
                  className="h-48 bg-center bg-cover"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                />
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-gray-600 mb-4">{banner.subtitle}</p>
                )}
                
                {/* 기존 버튼 */}
                {banner.button_text && (
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      기본 버튼: {banner.button_text}
                    </span>
                  </div>
                )}
                
                {/* 새 버튼들 */}
                {banner.buttons && banner.buttons.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">추가 버튼들:</p>
                    <div className="space-y-2">
                      {banner.buttons.map((btn, idx) => (
                        <span 
                          key={idx} 
                          className={`inline-block px-3 py-1 rounded-full text-sm mr-2 ${
                            btn.style === 'primary' ? 'bg-blue-100 text-blue-800' :
                            btn.style === 'secondary' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {btn.text} ({btn.style})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className={`text-sm ${banner.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {banner.is_active ? '활성' : '비활성'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingBanner(banner)
                        setShowForm(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function BannerForm({ 
  banner, 
  onSave, 
  onCancel 
}: { 
  banner: Banner
  onSave: (banner: Banner) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(banner)

  const handleButtonsChange = (index: number, field: 'text' | 'url' | 'style', value: string) => {
    if (!formData.buttons) return
    const newButtons = [...formData.buttons]
    newButtons[index] = { ...newButtons[index], [field]: value }
    setFormData({ ...formData, buttons: newButtons })
  }

  const addButton = () => {
    const newButtons = formData.buttons || []
    if (newButtons.length >= 3) {
      alert('최대 3개의 버튼만 추가할 수 있습니다.')
      return
    }
    setFormData({
      ...formData,
      buttons: [...newButtons, { text: '', url: '', style: 'primary' as const }]
    })
  }

  const removeButton = (index: number) => {
    if (!formData.buttons) return
    const newButtons = formData.buttons.filter((_, i) => i !== index)
    setFormData({ ...formData, buttons: newButtons })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {banner.id === 'new' ? '새 배너 추가' : '배너 편집'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">배너 제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">부제목</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">배너 이미지</label>
          <ImageUpload
            currentImageUrl={formData.image_url}
            onImageUploaded={(url) => setFormData({...formData, image_url: url})}
            folder="banners"
            placeholder="배너 이미지를 업로드하세요"
          />
        </div>

        {/* 기본 버튼 (기존 호환성) */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">기본 버튼 (기존)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">버튼 텍스트</label>
              <input
                type="text"
                value={formData.button_text || ''}
                onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="지금 상담받기"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">버튼 URL</label>
              <input
                type="url"
                value={formData.button_url || ''}
                onChange={(e) => setFormData({...formData, button_url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* 새 버튼들 (최대 3개) */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">추가 버튼 (최대 3개)</h4>
            <button
              type="button"
              onClick={addButton}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + 버튼 추가
            </button>
          </div>
          
          {formData.buttons?.map((button, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-xs text-gray-600 mb-1">버튼 텍스트</label>
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) => handleButtonsChange(index, 'text', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="버튼 텍스트"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">URL</label>
                <input
                  type="url"
                  value={button.url}
                  onChange={(e) => handleButtonsChange(index, 'url', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">스타일</label>
                <select
                  value={button.style}
                  onChange={(e) => handleButtonsChange(index, 'style', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeButton(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">배경색</label>
            <input
              type="color"
              value={formData.background_color}
              onChange={(e) => setFormData({...formData, background_color: e.target.value})}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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