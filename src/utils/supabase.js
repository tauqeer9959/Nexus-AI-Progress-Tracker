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
console.log('[NEXUS] Initializing Supabase...');
console.log('[NEXUS] URL:', FINAL_URL);
console.log('[NEXUS] Key starts with:', FINAL_ANON_KEY ? FINAL_ANON_KEY.substring(0, 10) + '...' : 'MISSING');

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

// Config is valid if we have either env vars OR the fallbacks are active
export const isSupabaseConfigured = !!FINAL_URL && !!FINAL_ANON_KEY && !FINAL_URL.includes('your-project')
