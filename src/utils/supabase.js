import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Strict validation: No fallbacks, no placeholders.
// Environment variables MUST be set in .env (local) and Vercel (production).
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
  console.error(
    '[NEXUS] Supabase configuration is INCOMPLETE.\n' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly in your environment.'
  )
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && !supabaseUrl.includes('your-project')
