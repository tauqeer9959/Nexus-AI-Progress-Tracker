import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[NEXUS] Auth Event: ${event}`);
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }

      // If we just signed in (e.g. following an OAuth redirect), ensure we aren't stuck loading
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it (likely a new OAuth user)
      const { data: newData, error: createError } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();
      
      if (!createError) setProfile(newData);
    } else {
      setProfile(data);
    }
    setLoading(false);
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
    const REDIRECT_URL = window.location.origin + '/dashboard';
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
    const REDIRECT_URL = window.location.origin + '/dashboard';
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
