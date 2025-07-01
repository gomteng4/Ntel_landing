'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SiteSettings, MenuItem } from '@/types'

export default function Header() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    fetchSiteSettings()
    fetchMenuItems()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single()
      
      if (data) setSiteSettings(data)
    } catch (error) {
      console.error('Error fetching site settings:', error)
      // 기본 설정 적용
      setSiteSettings({
        id: '1',
        site_name: '승승통신',
        logo_url: '',
        primary_button_text: '가입신청',
        primary_button_url: '#signup',
        secondary_button_text: '고객센터',
        secondary_button_url: '#contact',
        created_at: '',
        updated_at: ''
      })
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (data) setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      // 기본 메뉴 아이템 설정
      setMenuItems([
        { id: '1', title: '홈', url: '/', sort_order: 1, is_active: true, has_dropdown: false, menu_type: 'link', created_at: '', updated_at: '' }
      ])
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            {siteSettings?.logo_url ? (
              <img 
                src={siteSettings.logo_url} 
                alt={siteSettings.site_name || "로고"}
                className="h-8 w-auto"
              />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {siteSettings?.site_name || '승승통신'}
              </div>
            )}
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url || '#'}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  item.menu_type === 'board' 
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                title={item.menu_type === 'board' ? `${item.title} 게시판` : item.title}
              >
                {item.title}
                {item.menu_type === 'board' && (
                  <span className="ml-1 text-xs text-blue-500">📋</span>
                )}
              </Link>
            ))}
            
            {/* CTA 버튼들 */}
            <div className="flex items-center space-x-4">
              {siteSettings?.secondary_button_text && siteSettings?.secondary_button_url && (
                <a
                  href={siteSettings.secondary_button_url}
                  className="text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {siteSettings.secondary_button_text}
                </a>
              )}
              {siteSettings?.primary_button_text && siteSettings?.primary_button_url && (
                <a
                  href={siteSettings.primary_button_url}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  {siteSettings.primary_button_text}
                </a>
              )}
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url || '#'}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  title={item.menu_type === 'board' ? `${item.title} 게시판` : item.title}
                >
                  <span className="flex items-center">
                    {item.title}
                    {item.menu_type === 'board' && (
                      <span className="ml-1 text-xs text-blue-500">📋</span>
                    )}
                  </span>
                </Link>
              ))}
              
              {/* 모바일 CTA 버튼들 */}
              <div className="pt-4 space-y-2">
                {siteSettings?.secondary_button_text && siteSettings?.secondary_button_url && (
                  <a
                    href={siteSettings.secondary_button_url}
                    className="block w-full text-center text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {siteSettings.secondary_button_text}
                  </a>
                )}
                {siteSettings?.primary_button_text && siteSettings?.primary_button_url && (
                  <a
                    href={siteSettings.primary_button_url}
                    className="block w-full text-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {siteSettings.primary_button_text}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 