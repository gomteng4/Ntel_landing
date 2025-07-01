'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

interface BoardInfo {
  title: string
  tableName: string
  description?: string
}

export default function DynamicBoardPage() {
  const params = useParams()
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  useEffect(() => {
    if (slug) {
      initializeBoard()
    }
  }, [slug])

  const initializeBoard = async () => {
    try {
      // 1. 메뉴에서 게시판 정보 조회
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_type', 'board')
        .eq('board_table_name', `board_${slug}`)
        .single()

      if (menuError || !menuData) {
        setError('게시판을 찾을 수 없습니다.')
        setLoading(false)
        return
      }

      setBoardInfo({
        title: menuData.title,
        tableName: menuData.board_table_name || `board_${slug}`,
        description: `${menuData.title} 게시판입니다.`
      })

      // 2. 게시판 게시글 조회
      await fetchPosts(menuData.board_table_name || `board_${slug}`)

    } catch (error) {
      console.error('Error initializing board:', error)
      setError('게시판 로딩 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const fetchPosts = async (tableName: string) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching posts:', error)
        setError('게시글을 불러올 수 없습니다.')
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('게시글을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로딩 중...</h2>
          <p className="text-gray-600">게시판을 불러오고 있습니다.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{boardInfo?.title}</h1>
              <p className="text-gray-600 mt-1">{boardInfo?.description}</p>
            </div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 게시판 헤더 */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                총 {posts.length}개의 게시글
              </span>
              <span className="text-sm text-gray-500">
                마지막 업데이트: {posts.length > 0 ? new Date(posts[0].created_at).toLocaleDateString() : '없음'}
              </span>
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="divide-y divide-gray-200">
            {posts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 게시글이 없습니다</h3>
                <p className="text-gray-500">첫 번째 게시글을 작성해보세요.</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-blue-600">#{posts.length - index}</span>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.content ? post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') : '내용이 없습니다.'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(post.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {post.updated_at !== post.created_at && (
                          <span className="text-orange-500 text-xs">수정됨</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 