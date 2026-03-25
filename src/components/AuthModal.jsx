import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../utils/supabase';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGitHub } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError("Supabase credentials are missing! Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.");
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await signUpWithEmail(email, password, fullName);
        if (signUpError) throw signUpError;
        
        // Supabase requires email confirmation by default for wild enrollments
        if (data?.user && !data?.session) {
          setSuccessMsg("Account created! Please check your email to verify your account before logging in.");
          setMode('login');
          setLoading(false);
          return;
        }

        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) throw signInError;
        onClose();
      } else {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) throw signInError;
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError(null);
    setLoading(true);
    try {
      const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithGitHub();
      if (error) throw error;
      // Note: The page will redirect on success, so we don't necessarily need to set loading false here
      // but in case it doesn't redirect immediately or there's a delay:
    } catch (err) {
      setError(err.message || 'OAuth failed');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-sm text-slate-400">
              {mode === 'login' ? 'Enter your details to access your dashboard.' : 'Start tracking your AI journey today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center mt-6">
              {loading ? <Loader2 size={18} className="animate-spin" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="text-primary-400 font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Social Auth */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-slate-500 mb-4">Or continue with</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium text-white"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
                GitHub
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
