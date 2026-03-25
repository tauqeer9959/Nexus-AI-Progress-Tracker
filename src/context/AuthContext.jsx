import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id, currentUser);
      else setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[NEXUS] Auth Event: ${event}`);
      const currentUser = session?.user ?? null;
      
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.id, currentUser);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId, userData) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (error && error.code === 'PGRST116') {
        console.log('[NEXUS] Profile not found, creating new entry...');
        const name = userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'User';
        
        const { data: newData, error: createError } = await supabase
          .from('profiles')
          .upsert({ 
            id: userId, 
            full_name: name,
            updated_at: new Date().toISOString() 
          })
          .select()
          .single();
        
        if (createError) console.error('[NEXUS] Profile upsert failed:', createError);
        else setProfile(newData);
      } else if (error) {
        console.error('[NEXUS] Profile fetch error:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('[NEXUS] fetchProfile exception:', err);
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
