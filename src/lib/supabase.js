import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
