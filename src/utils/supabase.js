import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const MISSING_CREDS = !supabaseUrl || !supabaseAnonKey

if (MISSING_CREDS) {
  console.warn(
    '[NEXUS] Supabase credentials missing.\n' +
    'Create a .env file in the project root with:\n' +
    '  VITE_SUPABASE_URL=your_supabase_url\n' +
    '  VITE_SUPABASE_ANON_KEY=your_anon_key\n' +
    'The app will run in demo mode (auth disabled).'
  )
}

// Use placeholder URLs to avoid createClient() throwing on empty strings
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false // Prevents the browser from remembering the login
    }
  }
)

export const isSupabaseConfigured = !MISSING_CREDS
