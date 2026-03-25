import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const MISSING_CREDS = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')

// Fixed Supabase URL for this project
const FINAL_URL = supabaseUrl && !supabaseUrl.includes('your-project')
  ? supabaseUrl
  : 'https://ktmyezkkzqscgpmynnql.supabase.co';

// Hardcoded Anon Key for this project (Safe to be public in frontend)
// We use a more aggressive check to ignore common placeholders and faulty keys
// Verified Key matches project ref: ktmyezkkzqscgpmynnql
const isPlaceholder = !supabaseAnonKey || supabaseAnonKey.includes('your') || supabaseAnonKey.length < 50;

const FINAL_ANON_KEY = isPlaceholder
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXllemtrenFzY2dwbXlubnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU0MDAsImV4cCI6MjA4OTk0MTQwMH0.B5a78LchYU7bXcj_x84jF2D-9vGE5NKcg05FtJXlYEg'
  : supabaseAnonKey;

console.log('[NEXUS] Initializing Supabase...');
console.log('[NEXUS] URL:', FINAL_URL);
console.log('[NEXUS] Key Status:', isPlaceholder ? 'Using Hardcoded Fallback' : 'Using Environment Variable');
console.log('[NEXUS] Key starts with:', FINAL_ANON_KEY.substring(0, 10) + '...');

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
