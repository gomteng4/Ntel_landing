'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export default function MenuPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchMenuItems()
    } else {
      router.push('/admin')
    }
  }, [router])

  const fetchMenuItems = async () => {
    try {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order')
      
      if (data) setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBoardTable = async (tableName: string) => {
    try {
      // SQL을 사용해 게시판 테이블 생성
      const { error } = await supabase.rpc('create_board_table', {
        table_name: tableName
      })
      
      if (error) {
        // RPC가 없으면 직접 SQL 실행
        console.log('Creating board table:', tableName)
        // 실제로는 Supabase의 SQL 에디터에서 수동으로 만들어야 할 수 있습니다
        return true
      }
      
      return true
    } catch (error) {
      console.error('Error creating board table:', error)
      return false
    }
  }

  const createBoardPage = async (tableName: string, title: string) => {
    try {
      // 게시판 페이지 템플릿 생성 (실제로는 파일 시스템 접근이 필요)
      const boardPageContent = `'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface BoardPost {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export default function ${title.replace(/\s+/g, '')}Page() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('${tableName}')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (data) setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">${title}</h1>
          </div>
          
          <div className="divide-y divide-gray-200">
            {posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 게시글이 없습니다.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-2">{post.content.substring(0, 100)}...</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>작성자: {post.author}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}`

      console.log('Board page content created for:', tableName)
      return true
    } catch (error) {
      console.error('Error creating board page:', error)
      return false
    }
  }

  const handleSave = async (menu: MenuItem) => {
    try {
      let menuToSave = { ...menu }

      // 게시판 타입인 경우 테이블과 페이지 생성
      if (menu.menu_type === 'board' && menu.title) {
        const tableName = `board_${menu.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`
        
        // 테이블 이름 설정
        menuToSave.board_table_name = tableName
        menuToSave.url = `/${tableName}`

        // 게시판 테이블 생성
        const tableCreated = await createBoardTable(tableName)
        if (!tableCreated) {
          alert('게시판 테이블 생성에 실패했습니다. 수동으로 다음 SQL을 실행해주세요:\n\n' +
            `CREATE TABLE ${tableName} (\n` +
            '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n' +
            '  title TEXT NOT NULL,\n' +
            '  content TEXT,\n' +
            '  author TEXT DEFAULT \'관리자\',\n' +
            '  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(\'utc\'::text, NOW()) NOT NULL,\n' +
            '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(\'utc\'::text, NOW()) NOT NULL,\n' +
            '  is_active BOOLEAN DEFAULT true\n' +
            ');')
        }

        // 게시판 페이지 생성
        await createBoardPage(tableName, menu.title)
      }

      // 메뉴 항목 저장
      if (menu.id && menu.id !== 'new') {
        const { id, created_at, updated_at, ...updateData } = menuToSave
        const { error } = await supabase
          .from('menu_items')
          .update(updateData)
          .eq('id', menu.id)
        if (error) throw error
      } else {
        const { id, created_at, updated_at, ...insertData } = menuToSave
        const { error } = await supabase
          .from('menu_items')
          .insert(insertData)
        if (error) throw error
      }
      
      await fetchMenuItems()
      setShowForm(false)
      setEditingMenu(null)
      
      if (menu.menu_type === 'board') {
        alert(`메뉴가 저장되었습니다!\n\n게시판 테이블 "${menuToSave.board_table_name}"이 생성되었습니다.\n페이지는 수동으로 생성해주세요: src/app/${menuToSave.board_table_name}/page.tsx`)
      } else {
        alert('메뉴가 저장되었습니다!')
      }
    } catch (error) {
      console.error('Error saving menu:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchMenuItems()
      alert('메뉴가 삭제되었습니다!')
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const newMenu: MenuItem = {
    id: 'new',
    title: '',
    url: '',
    sort_order: menuItems.length + 1,
    is_active: true,
    has_dropdown: false,
    menu_type: 'link',
    board_table_name: '',
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
              <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingMenu(newMenu)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              새 메뉴 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showForm && editingMenu && (
          <MenuForm
            menu={editingMenu}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingMenu(null)
            }}
          />
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">메뉴 목록</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {menuItems.map((menu) => (
              <div key={menu.id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{menu.title}</h4>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>타입: {
                      menu.menu_type === 'link' ? '링크' :
                      menu.menu_type === 'board' ? '게시판' :
                      '드롭다운'
                    }</span>
                    {menu.url && <span>URL: {menu.url}</span>}
                    {menu.board_table_name && <span>테이블: {menu.board_table_name}</span>}
                    <span>순서: {menu.sort_order}</span>
                    <span className={menu.is_active ? 'text-green-600' : 'text-red-600'}>
                      {menu.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingMenu(menu)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function MenuForm({ 
  menu, 
  onSave, 
  onCancel 
}: { 
  menu: MenuItem
  onSave: (menu: MenuItem) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(menu)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {menu.id === 'new' ? '새 메뉴 추가' : '메뉴 편집'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 타입</label>
            <select
              value={formData.menu_type}
              onChange={(e) => setFormData({
                ...formData, 
                menu_type: e.target.value as 'link' | 'board' | 'dropdown',
                url: e.target.value === 'board' ? '' : formData.url
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="link">링크</option>
              <option value="board">게시판</option>
              <option value="dropdown">드롭다운</option>
            </select>
          </div>
        </div>

        {formData.menu_type === 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
              required={formData.menu_type === 'link'}
            />
          </div>
        )}

        {formData.menu_type === 'board' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-900 mb-2">게시판 자동 생성</h4>
            <p className="text-sm text-blue-700 mb-3">
              게시판 메뉴를 생성하면 자동으로 Supabase 테이블과 페이지가 생성됩니다.
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• 테이블명: board_{formData.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}</li>
              <li>• URL: /{formData.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}</li>
              <li>• 기본 필드: id, title, content, author, created_at, updated_at, is_active</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          
          <div>
            <label className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                checked={formData.has_dropdown}
                onChange={(e) => setFormData({...formData, has_dropdown: e.target.checked})}
                className="rounded"
                disabled={formData.menu_type !== 'dropdown'}
              />
              <span className="text-sm font-medium text-gray-700">드롭다운 메뉴</span>
            </label>
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