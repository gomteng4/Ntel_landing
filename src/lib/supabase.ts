import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://suznpkxteqhvqvlaenrq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1em5wa3h0ZXFodnF2bGFlbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzQ2NDYsImV4cCI6MjA2NjkxMDY0Nn0.hgGYLUWMoyjB4SpyEfR2nOqaAvPonaefyRZ6T3UYRO8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 