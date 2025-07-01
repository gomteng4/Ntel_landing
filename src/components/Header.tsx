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
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.title}
              </Link>
            ))}
            
            {/* CTA 버튼들 */}
            {siteSettings && (
              <div className="flex items-center space-x-4">
                <a
                  href={siteSettings.secondary_button_url}
                  className="text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {siteSettings.secondary_button_text}
                </a>
                <a
                  href={siteSettings.primary_button_url}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  {siteSettings.primary_button_text}
                </a>
              </div>
            )}
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
                >
                  {item.title}
                </Link>
              ))}
              
              {/* 모바일 CTA 버튼들 */}
              {siteSettings && (
                <div className="pt-4 space-y-2">
                  <a
                    href={siteSettings.secondary_button_url}
                    className="block w-full text-center text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {siteSettings.secondary_button_text}
                  </a>
                  <a
                    href={siteSettings.primary_button_url}
                    className="block w-full text-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {siteSettings.primary_button_text}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 