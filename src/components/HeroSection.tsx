'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Banner } from '@/types'

const defaultBanner: Banner = {
  id: '1',
  title: '안벤데뿔 통화 유심의 업계 가능',
  subtitle: '유심 헬피 출동하면 유심으로 개통 하주세요!',
  image_url: '',
  button_text: '구매 바로가기',
  button_url: '#purchase',
  background_color: '#ff6b6b',
  sort_order: 1,
  is_active: true,
  created_at: '',
  updated_at: '',
  buttons: []
}

export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([defaultBanner])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [banners.length])

  const fetchBanners = async () => {
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (data && data.length > 0) {
        setBanners(data)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const getButtonStyle = (style: 'primary' | 'secondary' | 'outline') => {
    switch (style) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600'
      case 'secondary':
        return 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-600'
      case 'outline':
        return 'bg-transparent hover:bg-white hover:text-gray-900 text-white border-2 border-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600'
    }
  }

  if (banners.length === 0) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            배너를 설정해주세요
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            관리자 페이지에서 배너를 추가할 수 있습니다
          </p>
        </div>
      </section>
    )
  }

  const currentBanner = banners[currentSlide]

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 배경 슬라이더 */}
      <div className="absolute inset-0">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundColor: banner.background_color,
              backgroundImage: banner.image_url ? `url(${banner.image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {currentBanner.title}
            </h1>
            
            {currentBanner.subtitle && (
              <p className="text-xl md:text-2xl text-white mb-12 opacity-90 leading-relaxed">
                {currentBanner.subtitle}
              </p>
            )}

            {/* 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* 기존 버튼 (기본) */}
              {currentBanner.button_text && currentBanner.button_url && (
                <a
                  href={currentBanner.button_url}
                  className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {currentBanner.button_text}
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {/* 새로운 버튼들 (최대 3개) */}
              {currentBanner.buttons && currentBanner.buttons.map((button, index) => (
                button.text && button.url && (
                  <a
                    key={index}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(button.style)}`}
                  >
                    {button.text}
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 네비게이션 화살표 */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 페이지 인디케이터 */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
} 