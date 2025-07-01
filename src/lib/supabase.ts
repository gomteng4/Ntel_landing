import { createClient } from '@supabase/supabase-js'

// 환경변수나 기본값이 유효한지 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://suznpkxteqhvqvlaenrq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1em5wa3h0ZXFodnF2bGFlbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzQ2NDYsImV4cCI6MjA2NjkxMDY0Nn0.hgGYLUWMoyjB4SpyEfR2nOqaAvPonaefyRZ6T3UYRO8'

// URL 유효성 검사
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 클라이언트 생성 (서버사이드에서 안전하게)
let supabase: any = null

if (typeof window !== 'undefined' || isValidUrl(supabaseUrl)) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn('Supabase client initialization failed:', error)
    // 대체 클라이언트 (더미)
    supabase = {
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: () => ({}),
        order: () => ({})
      })
    }
  }
}

export { supabase } 