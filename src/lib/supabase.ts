import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// Validate environment variables
if (!supabaseUrl) {
  console.error('Supabase URL is missing or invalid')
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing or invalid')
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (e) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error('Invalid VITE_SUPABASE_URL format. Must be a valid URL.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    debug: true
  }
})
