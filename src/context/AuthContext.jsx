import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes — this handles INITIAL_SESSION on page load
    // which fires before any getSession() call resolves, making it the single source of truth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[NEXUS] Auth Event: ${event}`);
      const currentUser = session?.user ?? null;

      if (currentUser) {
        setUser(currentUser);
        
        // Clean OAuth callback params from URL so they don't persist on refresh
        if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        await fetchProfile(currentUser);
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
        // Auto-create profile for new OAuth or email users
        const name = userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'User';
        const avatarUrl = userData?.user_metadata?.avatar_url || userData?.user_metadata?.picture || null;
        const { data: newData, error: createError } = await supabase
          .from('profiles')
          .upsert({ 
            id: userData.id, 
            full_name: name,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString() 
          })
          .select()
          .single();
        
        if (!createError) setProfile(newData);
        else console.error('[NEXUS] Profile creation error:', createError.message);
      } else if (error) {
        console.error('[NEXUS] fetchProfile error:', error.message);
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
    // Use dynamic origin so this works on localhost, preview URLs, and production
    const redirectTo = `${window.location.origin}/`;
    console.log('[NEXUS] Initiating Google OAuth, redirect to:', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { 
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      } 
    });
    if (error) console.error('[NEXUS] Google login error:', error.message);
    return { data, error };
  }

  async function signInWithGitHub() {
    const redirectTo = `${window.location.origin}/`;
    console.log('[NEXUS] Initiating GitHub OAuth, redirect to:', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github', 
      options: { redirectTo } 
    });
    if (error) console.error('[NEXUS] GitHub login error:', error.message);
    return { data, error };
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[NEXUS] signOut error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    }
  }

  async function updateProfile(updates) {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();
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
