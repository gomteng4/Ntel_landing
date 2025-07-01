'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { EventBanner } from '@/types'

export default function EventBanners() {
  const [eventBanners, setEventBanners] = useState<EventBanner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchEventBanners()
  }, [])

  useEffect(() => {
    if (eventBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % eventBanners.length)
      }, 6000) // 6초마다 자동 슬라이드

      return () => clearInterval(interval)
    }
  }, [eventBanners.length])

  const fetchEventBanners = async () => {
    const { data } = await supabase
      .from('event_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (data) setEventBanners(data)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % eventBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + eventBanners.length) % eventBanners.length)
  }

  if (eventBanners.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            고객님이 찾던 엔텔레콤을 이용하세요
          </h2>
          <p className="text-lg text-gray-600">
            엔텔레콤 진행중인 이벤트 🎁
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {eventBanners.map((banner, index) => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 첫 번째 배너 */}
                    <div 
                      className="relative rounded-lg p-8 text-white overflow-hidden"
                      style={{
                        backgroundImage: banner.image_url 
                          ? `url(${banner.image_url})` 
                          : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {banner.image_url && (
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      )}
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">
                          {banner.title}
                        </h3>
                        {banner.description && (
                          <p className="text-lg opacity-90 mb-6">
                            {banner.description}
                          </p>
                        )}
                        {banner.link_url ? (
                          <a 
                            href={banner.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                          >
                            자세히 보기
                          </a>
                        ) : (
                          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            자세히 보기
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 두 번째 배너 (다음 배너가 있을 경우) */}
                    {eventBanners[index + 1] && (
                      <div 
                        className="relative rounded-lg p-8 text-white overflow-hidden"
                        style={{
                          backgroundImage: eventBanners[index + 1].image_url 
                            ? `url(${eventBanners[index + 1].image_url})` 
                            : 'linear-gradient(to right, #10b981, #0d9488)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {eventBanners[index + 1].image_url && (
                          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        )}
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold mb-4">
                            {eventBanners[index + 1].title}
                          </h3>
                          {eventBanners[index + 1].description && (
                            <p className="text-lg opacity-90 mb-6">
                              {eventBanners[index + 1].description}
                            </p>
                          )}
                          {eventBanners[index + 1].link_url ? (
                            <a 
                              href={eventBanners[index + 1].link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                              자세히 보기
                            </a>
                          ) : (
                            <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                              자세히 보기
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          {eventBanners.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 슬라이드 인디케이터 */}
              <div className="flex justify-center mt-6 space-x-2">
                {eventBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
} 