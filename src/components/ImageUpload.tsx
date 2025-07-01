'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  folder?: string
  placeholder?: string
  className?: string
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  folder = 'general',
  placeholder = '이미지를 선택하세요',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      
      // 파일 이름 생성 (타임스탬프 + 원본 파일명)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        console.error('Supabase Storage 오류:', error)
        throw new Error('Storage 업로드에 실패했습니다. URL을 직접 입력해주세요.')
      }

      // 업로드된 이미지의 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setPreviewUrl(publicUrl)
      onImageUploaded(publicUrl)
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert(`이미지 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      // 업로드 실패 시 URL 입력 모드로 전환
      setShowUrlInput(true)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 이미지 업로드
    uploadImage(file)
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      alert('URL을 입력해주세요.')
      return
    }

    // 간단한 URL 유효성 검사
    try {
      new URL(urlInput)
      setPreviewUrl(urlInput)
      onImageUploaded(urlInput)
      setShowUrlInput(false)
      setUrlInput('')
    } catch {
      alert('올바른 URL을 입력해주세요.')
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onImageUploaded('')
    setUrlInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* 미리보기 영역 */}
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="미리보기"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">{placeholder}</p>
          </div>
        </div>
      )}

      {/* URL 입력 섹션 */}
      {showUrlInput && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 URL 직접 입력
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
            >
              적용
            </button>
          </div>
        </div>
      )}

      {/* 업로드 버튼들 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              업로드 중...
            </div>
          ) : (
            '파일 선택'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          URL 입력
        </button>
        
        {previewUrl && (
          <button
            type="button"
            onClick={removeImage}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            제거
          </button>
        )}
      </div>

      {/* 안내 텍스트 */}
      <p className="text-xs text-gray-500">
        파일 업로드 또는 이미지 URL을 직접 입력할 수 있습니다. (JPG, PNG, GIF, 최대 5MB)
      </p>
    </div>
  )
} 