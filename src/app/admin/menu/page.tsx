'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'

export default function MenuPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const router = useRouter()

  // 미리 정의된 게시판 목록
  const PRESET_BOARDS = [
    { id: 'board_notice', name: '공지사항', description: '중요한 공지사항을 게시합니다' },
    { id: 'board_faq', name: '자주묻는질문', description: 'FAQ와 도움말을 제공합니다' },
    { id: 'board_qna', name: '질문답변', description: '질문과 답변을 주고받습니다' },
    { id: 'board_news', name: '뉴스/소식', description: '최신 뉴스와 소식을 전합니다' },
    { id: 'board_free', name: '자유게시판', description: '자유로운 의견을 나눕니다' }
  ]

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

  const handleSave = async (menu: MenuItem) => {
    try {
      let menuToSave = { ...menu }

      // 게시판 타입인 경우 URL 설정
      if (menu.menu_type === 'board' && menu.board_table_name) {
        // board/[slug] 동적 라우팅 사용
        const boardSlug = menu.board_table_name.replace('board_', '')
        menuToSave.url = `/board/${boardSlug}`
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
      alert('메뉴가 성공적으로 저장되었습니다!')
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
            presetBoards={PRESET_BOARDS}
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
  presetBoards,
  onSave, 
  onCancel 
}: { 
  menu: MenuItem
  presetBoards: Array<{id: string, name: string, description: string}>
  onSave: (menu: MenuItem) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(menu)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleBoardChange = (boardId: string) => {
    const selectedBoard = presetBoards.find(board => board.id === boardId)
    if (selectedBoard) {
      setFormData({
        ...formData,
        board_table_name: boardId,
        title: selectedBoard.name,
        url: `/board/${boardId.replace('board_', '')}`
      })
    }
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
                url: e.target.value === 'board' ? '' : formData.url,
                board_table_name: e.target.value === 'board' ? '' : formData.board_table_name
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">게시판 선택</label>
              <select
                value={formData.board_table_name || ''}
                onChange={(e) => handleBoardChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">게시판을 선택하세요</option>
                {presetBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name} - {board.description}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.board_table_name && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-blue-900 mb-2">선택된 게시판 정보</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 테이블명: {formData.board_table_name}</p>
                  <p>• URL: {formData.url}</p>
                  <p>• 설명: {presetBoards.find(b => b.id === formData.board_table_name)?.description}</p>
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  <p>※ 이 게시판은 이미 Supabase에 생성되어 있으며 즉시 사용 가능합니다.</p>
                </div>
              </div>
            )}
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