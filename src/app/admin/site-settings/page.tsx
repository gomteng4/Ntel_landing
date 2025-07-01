'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SiteSettings } from '@/types'
import ImageUpload from '@/components/ImageUpload'



export default function SiteSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchSiteSettings()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchSiteSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single()
      
      if (data) {
        setSiteSettings(data)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!siteSettings) return

    setSaving(true)
    try {
      const { id, created_at, updated_at, ...updateData } = siteSettings
      const { error } = await supabase
        .from('site_settings')
        .upsert(updateData)
      
      if (error) throw error
      
      alert('사이트 설정이 저장되었습니다!')
    } catch (error) {
      console.error('Error saving site settings:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    if (!siteSettings) return
    setSiteSettings({
      ...siteSettings,
      [field]: value
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
              <h1 className="text-2xl font-bold text-gray-900">사이트 설정</h1>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              사이트 보기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">기본 설정</h3>
            <p className="mt-1 text-sm text-gray-600">
              사이트 이름, 로고, 버튼 등의 기본 설정을 관리합니다.
            </p>
          </div>

          <form onSubmit={handleSave} className="px-6 py-4 space-y-8">
            {/* 사이트 기본 정보 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">사이트 기본 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">사이트 이름</label>
                  <input
                    type="text"
                    value={siteSettings?.site_name || ''}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="승승통신"
                  />
                </div>
              </div>
            </div>

            {/* 로고 설정 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">로고 설정</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">로고 이미지</label>
                  <ImageUpload
                    currentImageUrl={siteSettings?.logo_url}
                    onImageUploaded={(url) => handleInputChange('logo_url', url)}
                    folder="logos"
                    placeholder="로고 이미지를 업로드하세요"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">현재 로고 미리보기</label>
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      {siteSettings?.logo_url ? (
                        <img 
                          src={siteSettings.logo_url} 
                          alt="현재 로고" 
                          className="h-12 w-auto mx-auto"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <div className="text-2xl font-bold text-blue-600">
                            {siteSettings?.site_name || '승승통신'}
                          </div>
                          <p className="text-sm mt-2">로고가 설정되지 않음 (텍스트로 표시)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 메인 버튼 설정 */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">메인 버튼 설정</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주요 버튼 텍스트</label>
                  <input
                    type="text"
                    value={siteSettings?.primary_button_text || ''}
                    onChange={(e) => handleInputChange('primary_button_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="가입신청"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주요 버튼 URL</label>
                  <input
                    type="url"
                    value={siteSettings?.primary_button_url || ''}
                    onChange={(e) => handleInputChange('primary_button_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/signup"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">보조 버튼 텍스트</label>
                  <input
                    type="text"
                    value={siteSettings?.secondary_button_text || ''}
                    onChange={(e) => handleInputChange('secondary_button_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="고객센터"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">보조 버튼 URL</label>
                  <input
                    type="url"
                    value={siteSettings?.secondary_button_url || ''}
                    onChange={(e) => handleInputChange('secondary_button_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/contact"
                  />
                </div>
              </div>
            </div>

            {/* 미리보기 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">헤더 미리보기</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {siteSettings?.logo_url ? (
                      <img 
                        src={siteSettings.logo_url} 
                        alt="로고" 
                        className="h-8 w-auto"
                      />
                    ) : (
                      <div className="text-xl font-bold text-blue-600">
                        {siteSettings?.site_name || '승승통신'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      type="button"
                      className="text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      {siteSettings?.secondary_button_text || '고객센터'}
                    </button>
                    <button 
                      type="button"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    >
                      {siteSettings?.primary_button_text || '가입신청'}
                    </button>
                  </div>
                </div>
              </div>
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