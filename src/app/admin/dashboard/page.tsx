'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    banners: 0,
    menuItems: 0,
    serviceCards: 0,
    pricingPlans: 0,
    reviews: 0,
    eventBanners: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchStats()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchStats = async () => {
    try {
      const [banners, menuItems, serviceCards, pricingPlans, reviews, eventBanners] = await Promise.all([
        supabase.from('banners').select('id', { count: 'exact' }),
        supabase.from('menu_items').select('id', { count: 'exact' }),
        supabase.from('service_cards').select('id', { count: 'exact' }),
        supabase.from('pricing_plans').select('id', { count: 'exact' }),
        supabase.from('customer_reviews').select('id', { count: 'exact' }),
        supabase.from('event_banners').select('id', { count: 'exact' })
      ])

      setStats({
        banners: banners.count || 0,
        menuItems: menuItems.count || 0,
        serviceCards: serviceCards.count || 0,
        pricingPlans: pricingPlans.count || 0,
        reviews: reviews.count || 0,
        eventBanners: eventBanners.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      localStorage.removeItem('admin_auth')
      router.push('/admin')
    }
  }

  const adminSections = [
    {
      id: 'site-settings',
      title: '사이트 설정',
      description: '로고, 사이트명, 버튼 텍스트 관리',
      icon: '⚙️',
      href: '/admin/site-settings'
    },
    {
      id: 'banners',
      title: '배너 관리',
      description: '메인 히어로 배너 관리',
      icon: '🖼️',
      href: '/admin/banners',
      count: stats.banners
    },
    {
      id: 'menu',
      title: '메뉴 관리',
      description: '상단 네비게이션 메뉴 관리',
      icon: '📋',
      href: '/admin/menu',
      count: stats.menuItems
    },
    {
      id: 'service-cards',
      title: '서비스 카드',
      description: '서비스 아이콘 카드 관리',
      icon: '💼',
      href: '/admin/service-cards',
      count: stats.serviceCards
    },
    {
      id: 'pricing',
      title: '요금제 관리',
      description: '추천 요금제 및 태그 관리',
      icon: '💰',
      href: '/admin/pricing',
      count: stats.pricingPlans
    },
    {
      id: 'events',
      title: '이벤트 배너',
      description: '프로모션 배너 관리',
      icon: '🎉',
      href: '/admin/events',
      count: stats.eventBanners
    },
    {
      id: 'reviews',
      title: '고객 리뷰',
      description: '고객 후기 및 별점 관리',
      icon: '⭐',
      href: '/admin/reviews',
      count: stats.reviews
    },
    {
      id: 'footer',
      title: '푸터 설정',
      description: '연락처, QR코드, 회사 정보',
      icon: '📞',
      href: '/admin/footer'
    }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">인증 확인 중...</h2>
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
              <h1 className="text-2xl font-bold text-gray-900">앤플랫폼 관리자</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                온라인
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                🌐 사이트 보기
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                🚪 로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 대시보드 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                관리자 대시보드
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                모든 콘텐츠를 한 곳에서 관리하세요
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <span className="text-sm text-gray-500">
                마지막 업데이트: {new Date().toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.banners}</div>
                  <div className="text-blue-100 text-sm font-medium">배너</div>
                </div>
                <div className="text-2xl opacity-80">🖼️</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.pricingPlans}</div>
                  <div className="text-green-100 text-sm font-medium">요금제</div>
                </div>
                <div className="text-2xl opacity-80">💰</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.reviews}</div>
                  <div className="text-purple-100 text-sm font-medium">리뷰</div>
                </div>
                <div className="text-2xl opacity-80">⭐</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.eventBanners}</div>
                  <div className="text-orange-100 text-sm font-medium">이벤트</div>
                </div>
                <div className="text-2xl opacity-80">🎉</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리 섹션 그리드 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="text-4xl mb-2">{section.icon}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      {typeof section.count === 'number' && (
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                          {section.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-5">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-t border-gray-100">
                <div className="text-sm text-blue-700 flex items-center justify-between font-medium">
                  <span>지금 관리하기</span>
                  <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 퀵 액션 */}
        <div className="mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              빠른 작업
            </h3>
            <p className="text-blue-100 text-sm mt-1">자주 사용하는 작업들을 빠르게 실행하세요</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/banners"
                className="group text-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🖼️</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">새 배너</div>
                <div className="text-xs text-gray-500 mt-1">배너 추가</div>
              </Link>
              <Link
                href="/admin/pricing"
                className="group text-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">💰</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-green-700">요금제 추가</div>
                <div className="text-xs text-gray-500 mt-1">새 요금제</div>
              </Link>
              <Link
                href="/admin/reviews"
                className="group text-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⭐</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-purple-700">리뷰 추가</div>
                <div className="text-xs text-gray-500 mt-1">고객 후기</div>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="group text-center p-6 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🌐</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-orange-700">사이트 보기</div>
                <div className="text-xs text-gray-500 mt-1">미리보기</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 