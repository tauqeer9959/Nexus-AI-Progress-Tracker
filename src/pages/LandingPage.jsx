import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onEnter }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const features = [
    { icon: '🧠', title: 'ML/DL Roadmap', desc: 'Structured, editable learning path from beginner to AI architect.' },
    { icon: '📊', title: 'Smart Dashboard', desc: 'Track GPA, study hours, and skill mastery with real-time charts.' },
    { icon: '🤖', title: 'AI Mentor (Groq)', desc: 'Context-aware AI that knows your progress and guides you forward.' },
    { icon: '💼', title: 'Career Hub', desc: 'Track dream companies, roles, skill gaps, and your applications.' },
    { icon: '🎓', title: 'Edu Navigator', desc: 'Plan graduate school abroad with scholarship tracking.' },
    { icon: '📁', title: 'File Management', desc: 'Upload, organize, and share all your academic resources.' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-cyber-cyan bg-clip-text text-transparent">NEXUS</span>
          <span className="text-[10px] text-primary-400 font-medium tracking-widest uppercase mt-1">AI Student Tracker</span>
        </div>
        <div className="flex gap-3">
          {user ? (
            <button onClick={onEnter} className="px-5 py-2 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-400 text-sm font-bold hover:bg-primary-600/30 transition-all">
              Go to Dashboard &rarr;
            </button>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="px-5 py-2 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-400 text-sm font-medium hover:bg-primary-600/30 transition-all">
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary-900/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyber-cyan/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">
              AI-Powered Student Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
          >
            Navigate Your Path to{' '}
            <span className="bg-gradient-to-r from-primary-400 via-cyber-cyan to-cyber-fuchsia bg-clip-text text-transparent">
              AI Mastery
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            The intelligent platform for CS students targeting AI careers and global graduate schools. Track progress, get mentored by AI, and build your future—one phase at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {user ? (
              <button
                onClick={onEnter}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
              >
                Access Your Workspace &rarr;
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-cyber-cyan text-white rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-2xl shadow-primary-500/20 active:scale-95"
              >
                Get Started for Free
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-slate-400 max-w-xl mx-auto">One unified platform replacing scattered spreadsheets, notes, and apps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roadmap Preview */}
      <section className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-4">Your ML/DL Journey</h2>
          <p className="text-slate-400">A structured path, fully customizable to your goals.</p>
        </div>
        <div className="space-y-3">
          {['Phase 1: Mathematical Foundations', 'Phase 2: Python & Data Science', 'Phase 3: Machine Learning Core', 'Phase 4: Deep Learning Specialization'].map((phase, i) => (
            <div key={phase} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="font-display font-bold text-primary-500 text-sm w-6">0{i+1}</span>
              <span className="text-slate-300 font-medium">{phase}</span>
              <div className="ml-auto text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border font-bold"
                style={i < 2 ? { color: '#10b981', borderColor: '#10b98133' } : { color: '#64748b', borderColor: '#1e293b' }}>
                {i < 2 ? 'Complete' : 'Locked'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12 pb-32 text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-4">{user ? "Welcome Back to NEXUS" : "Ready to Build Your Future?"}</h2>
        <p className="text-slate-400 mb-8">{user ? "Your AI mentor and roadmap are waiting for you." : "Join now and get a personalized AI-powered tracker from day one."}</p>
        {user ? (
          <button onClick={onEnter} className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold rounded-2xl text-lg hover:opacity-90 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95">
            Continue Your Journey &rarr;
          </button>
        ) : (
          <button onClick={() => setAuthModalOpen(true)} className="px-10 py-4 bg-gradient-to-r from-primary-600 to-cyber-cyan text-white font-bold rounded-2xl text-lg hover:opacity-90 transition-all shadow-2xl shadow-primary-500/20 active:scale-95">
            Get Started for Free &rarr;
          </button>
        )}
      </section>

      <footer className="text-center py-8 border-t border-white/5 text-slate-600 text-sm">
        © 2025 NEXUS — AI Student Tracker
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
