'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FooterSettings } from '@/types'
import ImageUpload from '@/components/ImageUpload'



export default function FooterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchFooterSettings()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchFooterSettings = async () => {
    try {
      const { data } = await supabase
        .from('footer_settings')
        .select('*')
        .single()
      
      if (data) {
        setFooterSettings(data)
      }
    } catch (error) {
      console.error('Error fetching footer settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!footerSettings) return

    setSaving(true)
    try {
      const { id, created_at, updated_at, ...updateData } = footerSettings
      const { error } = await supabase
        .from('footer_settings')
        .upsert(updateData)
      
      if (error) throw error
      
      alert('푸터 설정이 저장되었습니다!')
    } catch (error) {
      console.error('Error saving footer settings:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof FooterSettings, value: string) => {
    if (!footerSettings) return
    setFooterSettings({
      ...footerSettings,
      [field]: value
    })
  }

  const handleQrCodeChange = (index: number, field: 'name' | 'url', value: string) => {
    if (!footerSettings?.qr_codes) return
    const newQrCodes = [...footerSettings.qr_codes]
    newQrCodes[index] = { ...newQrCodes[index], [field]: value }
    setFooterSettings({
      ...footerSettings,
      qr_codes: newQrCodes
    })
  }

  const addQrCode = () => {
    if (!footerSettings) return
    const newQrCodes = footerSettings.qr_codes || []
    setFooterSettings({
      ...footerSettings,
      qr_codes: [...newQrCodes, { name: '', url: '' }]
    })
  }

  const removeQrCode = (index: number) => {
    if (!footerSettings?.qr_codes) return
    const newQrCodes = footerSettings.qr_codes.filter((_, i) => i !== index)
    setFooterSettings({
      ...footerSettings,
      qr_codes: newQrCodes
    })
  }

  const handleAppStoreChange = (index: number, field: 'name' | 'url' | 'icon', value: string) => {
    if (!footerSettings?.app_store_links) return
    const newAppStoreLinks = [...footerSettings.app_store_links]
    newAppStoreLinks[index] = { ...newAppStoreLinks[index], [field]: value }
    setFooterSettings({
      ...footerSettings,
      app_store_links: newAppStoreLinks
    })
  }

  const addAppStoreLink = () => {
    if (!footerSettings) return
    const newAppStoreLinks = footerSettings.app_store_links || []
    setFooterSettings({
      ...footerSettings,
      app_store_links: [...newAppStoreLinks, { name: '', url: '', icon: '' }]
    })
  }

  const removeAppStoreLink = (index: number) => {
    if (!footerSettings?.app_store_links) return
    const newAppStoreLinks = footerSettings.app_store_links.filter((_, i) => i !== index)
    setFooterSettings({
      ...footerSettings,
      app_store_links: newAppStoreLinks
    })
  }

  const handleGalleryImageChange = (index: number, field: 'name' | 'url', value: string) => {
    if (!footerSettings?.gallery_images) return
    
    const updatedImages = [...footerSettings.gallery_images]
    updatedImages[index] = { ...updatedImages[index], [field]: value }
    setFooterSettings({
      ...footerSettings,
      gallery_images: updatedImages
    })
  }

  const addGalleryImage = () => {
    const currentImages = footerSettings?.gallery_images || []
    const newImage = { name: '', url: '' }
    setFooterSettings({
      ...footerSettings!,
      gallery_images: [...currentImages, newImage]
    })
  }

  const removeGalleryImage = (index: number) => {
    if (!footerSettings?.gallery_images) return
    
    const updatedImages = footerSettings.gallery_images.filter((_, i) => i !== index)
    setFooterSettings({
      ...footerSettings,
      gallery_images: updatedImages
    })
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
              <h1 className="text-2xl font-bold text-gray-900">푸터 설정</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">푸터 정보</h3>
            <p className="mt-1 text-sm text-gray-600">
              회사 정보, 연락처, QR 코드, 앱 다운로드 등을 관리합니다.
            </p>
          </div>

          <form onSubmit={handleSave} className="px-6 py-4 space-y-8">
            {/* 로고 섹션 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">로고 설정</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">로고 이미지 URL</label>
                  <input
                    type="url"
                    value={footerSettings?.logo_url || ''}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">로고 클릭 시 이동할 URL</label>
                  <input
                    type="url"
                    value={footerSettings?.logo_link_url || ''}
                    onChange={(e) => handleInputChange('logo_link_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* 회사 정보 섹션 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">회사 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                  <input
                    type="text"
                    value={footerSettings?.company_name || ''}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="승승통신"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="text"
                    value={footerSettings?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                <input
                  type="text"
                  value={footerSettings?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="서울시 강남구 테헤란로 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">영업시간</label>
                  <input
                    type="text"
                    value={footerSettings?.business_hours || ''}
                    onChange={(e) => handleInputChange('business_hours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="평일 09:00-18:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">배경색</label>
                  <input
                    type="color"
                    value={footerSettings?.background_color || '#1f2937'}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* 앱 다운로드 섹션 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">앱 다운로드 섹션</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">메인 텍스트</label>
                  <input
                    type="text"
                    value={footerSettings?.app_download_text || ''}
                    onChange={(e) => handleInputChange('app_download_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="편리함을 더하다"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">부제목</label>
                  <input
                    type="text"
                    value={footerSettings?.app_download_subtitle || ''}
                    onChange={(e) => handleInputChange('app_download_subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="지금 바로 앱에서 보세요"
                  />
                </div>
              </div>

              {/* 앱스토어 링크들 */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">앱스토어 링크</label>
                  <button
                    type="button"
                    onClick={addAppStoreLink}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 링크 추가
                  </button>
                </div>
                {footerSettings?.app_store_links?.map((link, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">이름</label>
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleAppStoreChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Google Play"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">아이콘 (이모지)</label>
                      <input
                        type="text"
                        value={link.icon}
                        onChange={(e) => handleAppStoreChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="📱"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleAppStoreChange(index, 'url', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="https://play.google.com/..."
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeAppStoreLink(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 이미지 갤러리 섹션 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">이미지 갤러리</h4>
              
              {/* 메인 추천 이미지 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">메인 추천 이미지</label>
                <ImageUpload
                  currentImageUrl={footerSettings?.feature_image_url}
                  onImageUploaded={(url) => handleInputChange('feature_image_url', url)}
                  folder="gallery"
                  placeholder="메인 추천 이미지 업로드"
                />
              </div>

              {/* 작은 갤러리 이미지들 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">갤러리 이미지</label>
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 갤러리 이미지 추가
                  </button>
                </div>
                {footerSettings?.gallery_images?.map((image, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">이미지 이름</label>
                      <input
                        type="text"
                        value={image.name}
                        onChange={(e) => handleGalleryImageChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="이미지 이름"
                      />
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          이미지 삭제
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">이미지</label>
                      <div className="w-full max-w-xs mx-auto">
                        <ImageUpload
                          currentImageUrl={image.url}
                          onImageUploaded={(url) => handleGalleryImageChange(index, 'url', url)}
                          folder="gallery"
                          placeholder="갤러리 이미지 업로드"
                        />
                      </div>
                      {image.url && (
                        <div className="mt-2 text-center">
                          <img 
                            src={image.url} 
                            alt={image.name} 
                            className="w-16 h-16 mx-auto border border-gray-200 rounded object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR 코드 섹션 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">QR 코드</label>
                <button
                  type="button"
                  onClick={addQrCode}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + QR 코드 추가
                </button>
              </div>
              {footerSettings?.qr_codes?.map((qr, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">QR 코드 이름</label>
                    <input
                      type="text"
                      value={qr.name}
                      onChange={(e) => handleQrCodeChange(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="카카오톡 상담"
                    />
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeQrCode(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        QR 코드 삭제
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">QR 코드 이미지</label>
                    <div className="w-full max-w-xs mx-auto">
                      <ImageUpload
                        currentImageUrl={qr.url}
                        onImageUploaded={(url) => handleQrCodeChange(index, 'url', url)}
                        folder="qr-codes"
                        placeholder="QR 코드 이미지 업로드"
                      />
                    </div>
                    {qr.url && (
                      <div className="mt-2 text-center">
                        <img 
                          src={qr.url} 
                          alt={qr.name} 
                          className="w-20 h-20 mx-auto border border-gray-200 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 