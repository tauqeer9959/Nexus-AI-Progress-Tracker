import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const MISSING_CREDS = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')

if (MISSING_CREDS) {
  console.warn(
    '[NEXUS] Supabase credentials missing or using placeholders.\n' +
    'Please check your .env file.'
  )
}

// Fixed Supabase URL for this project
const FINAL_URL = supabaseUrl && !supabaseUrl.includes('your-project') 
  ? supabaseUrl 
  : 'https://ktmyezkkzqscgpmynnql.supabase.co';

console.log('[NEXUS] Initializing Supabase with URL:', FINAL_URL);

export const supabase = createClient(
  FINAL_URL,
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

export const isSupabaseConfigured = !MISSING_CREDS
