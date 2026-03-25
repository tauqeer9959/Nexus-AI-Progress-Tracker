import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[NEXUS] Auth Event: ${event}`);
      const currentUser = session?.user ?? null;

      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser);
        
        // Clean URL after successful login
        if (event === 'SIGNED_IN' && (window.location.search.includes('code=') || window.location.hash.includes('access_token='))) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userData) {
    if (!userData) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Create new profile if missing
        const name = userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'User';
        const { data: newData, error: createError } = await supabase
          .from('profiles')
          .upsert({ 
            id: userData.id, 
            full_name: name,
            updated_at: new Date().toISOString() 
          })
          .select()
          .single();
        
        if (!createError) setProfile(newData);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('[NEXUS] fetchProfile error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  }

  async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });
    return { data, error };
  }

  async function signInWithGoogle() {
    const REDIRECT_URL = 'https://nexusaiprogresstracker.vercel.app/dashboard';
    console.log('[NEXUS] Initiating Google Login flow with redirect:', REDIRECT_URL);
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { 
        redirectTo: REDIRECT_URL,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      } 
    });
    if (error) console.error('[NEXUS] Google login error returned:', error.message);
    return { data, error };
  }

  async function signInWithGitHub() {
    const REDIRECT_URL = 'https://nexusaiprogresstracker.vercel.app/dashboard';
    console.log('[NEXUS] Initiating GitHub Login flow with redirect:', REDIRECT_URL);
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github', 
      options: { 
        redirectTo: REDIRECT_URL
      } 
    });
    if (error) console.error('[NEXUS] GitHub login error returned:', error.message);
    return { data, error };
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      // Hard redirect to ensure fresh app state and clear any cached context data
      window.location.href = '/'; 
    }
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase.from('profiles').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() }).select().single();
    if (!error) setProfile(data);
    return { data, error };
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGitHub, signOut, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
