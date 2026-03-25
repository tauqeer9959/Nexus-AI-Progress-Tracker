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

// Hardcoded Anon Key for this project (Safe to be public in frontend)
const FINAL_ANON_KEY = supabaseAnonKey && !supabaseAnonKey.includes('your-key')
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXllemtrenFzY2dwbXlubnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU0MDAsImV4cCI6MjA4OTk0MTQwMH0.B5a78LchYU7bXcj_x84jF2D-9vGE5NKcg05FtJXlYEg';

console.log('[NEXUS] Initializing Supabase with URL:', FINAL_URL);

export const supabase = createClient(
  FINAL_URL,
  FINAL_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

export const isSupabaseConfigured = !MISSING_CREDS
