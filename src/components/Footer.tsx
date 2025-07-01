'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FooterSettings } from '@/types'

export default function Footer() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null)

  useEffect(() => {
    fetchFooterSettings()
  }, [])

  const fetchFooterSettings = async () => {
    try {
      const { data } = await supabase
        .from('footer_settings')
        .select('*')
        .single()
      
      if (data) {
        setFooterSettings(data)
      } else {
        // 기본 푸터 설정 적용
        setDefaultFooterSettings()
      }
    } catch (error) {
      console.error('Error fetching footer settings:', error)
      // 오류 시에도 기본 푸터 설정 적용
      setDefaultFooterSettings()
    }
  }

  const setDefaultFooterSettings = () => {
    setFooterSettings({
      id: '1',
      company_name: '승승통신',
      logo_url: '',
      logo_link_url: '',
      address: '서울특별시 강남구',
      phone: '010-1234-5678',
      business_hours: '평일 09:00 - 18:00',
      qr_codes: [],
      app_download_text: '편리함을 더하다',
      app_download_subtitle: '지금 바로 앱에서 보세요',
      app_store_links: [],
      feature_image_url: '',
      gallery_images: [],
      background_color: '#1f2937',
      created_at: '',
      updated_at: ''
    })
  }

  // footerSettings가 null이어도 기본값으로 처리
  const settings = footerSettings || {
    id: '1',
    company_name: '승승통신',
    logo_url: '',
    logo_link_url: '',
    address: '서울특별시 강남구',
    phone: '010-1234-5678',
    business_hours: '평일 09:00 - 18:00',
    qr_codes: [],
    app_download_text: '편리함을 더하다',
    app_download_subtitle: '지금 바로 앱에서 보세요',
    app_store_links: [],
    feature_image_url: '',
    gallery_images: [],
    background_color: '#1f2937',
    created_at: '',
    updated_at: ''
  }

  return (
    <footer 
      className="relative text-white"
      style={{ backgroundColor: settings.background_color || '#1f2937' }}
    >
      {/* 배경과 구분하기 위한 상단 구분선 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 로고 및 회사 정보 */}
          <div className="lg:col-span-1">
            {/* 로고 */}
            {settings.logo_url && (
              <div className="mb-6">
                {settings.logo_link_url ? (
                  <a 
                    href={settings.logo_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={settings.logo_url} 
                      alt="로고" 
                      className="h-12 w-auto"
                    />
                  </a>
                ) : (
                  <img 
                    src={settings.logo_url} 
                    alt="로고" 
                    className="h-12 w-auto"
                  />
                )}
              </div>
            )}

            <h3 className="text-xl font-bold mb-4">{settings.company_name}</h3>
            
            <div className="space-y-2">
              {settings.address && (
                <p className="text-gray-300">
                  <span className="font-medium">주소:</span> {settings.address}
                </p>
              )}
              {settings.phone && (
                <p className="text-gray-300">
                  <span className="font-medium">전화:</span> {settings.phone}
                </p>
              )}
              {settings.business_hours && (
                <p className="text-gray-300">
                  <span className="font-medium">영업시간:</span> {settings.business_hours}
                </p>
              )}
            </div>
          </div>

          {/* 중앙: 앱 다운로드 및 QR 코드 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-lg border border-blue-500/30">
              <h4 className="text-lg font-semibold mb-2">
                {settings.app_download_text || '편리함을 더하다'}
              </h4>
              <p className="text-sm text-gray-300 mb-4">
                {settings.app_download_subtitle || '지금 바로 앱에서 보세요'}
              </p>
              
              {/* 앱스토어 링크들 */}
              {settings.app_store_links && settings.app_store_links.length > 0 ? (
                <div className="space-y-2 mb-6">
                  {settings.app_store_links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded-lg text-sm font-medium"
                    >
                      <span className="mr-2 text-lg">{link.icon}</span>
                      {link.name}
                    </a>
                  ))}
                </div>
              ) : (
                /* 기본 앱스토어 버튼들 */
                <div className="space-y-2 mb-6">
                  <button className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded-lg text-sm font-medium">
                    <span className="mr-2">📱</span>
                    Google Play
                  </button>
                  <button className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded-lg text-sm font-medium">
                    <span className="mr-2">🍎</span>
                    App Store
                  </button>
                </div>
              )}

              {/* QR 코드들 (가로 배열) */}
              {settings.qr_codes && settings.qr_codes.length > 0 ? (
                <div>
                  <h5 className="text-sm font-medium mb-3 text-center">빠른 상담</h5>
                  <div className="flex justify-center space-x-4">
                    {settings.qr_codes.slice(0, 3).map((qr, index) => (
                      <div key={index} className="text-center">
                        <img 
                          src={qr.url} 
                          alt={qr.name}
                          className="w-16 h-16 mx-auto mb-1 bg-white p-1 rounded"
                        />
                        <p className="text-xs text-gray-300">{qr.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-400">QR 코드를 추가해주세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 이미지 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold mb-4 text-center">추천 이미지</h4>
              
              {/* 메인 이미지 */}
              {settings.feature_image_url ? (
                <div className="mb-4">
                  <img 
                    src={settings.feature_image_url} 
                    alt="추천 이미지"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-sm">이미지를 업로드하세요</span>
                </div>
              )}

              {/* 작은 이미지들 */}
              <div className="grid grid-cols-3 gap-2">
                {settings.gallery_images && settings.gallery_images.length > 0 ? (
                  settings.gallery_images.slice(0, 3).map((image, index) => (
                    <img 
                      key={index}
                      src={image.url} 
                      alt={image.name || `갤러리 ${index + 1}`}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))
                ) : (
                  <>
                    <div className="w-full h-16 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">이미지</span>
                    </div>
                    <div className="w-full h-16 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">이미지</span>
                    </div>
                    <div className="w-full h-16 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">이미지</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-12 pt-8 border-t border-gray-600 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 {settings.company_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 