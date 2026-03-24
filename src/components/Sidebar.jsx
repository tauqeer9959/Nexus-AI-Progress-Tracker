import React from 'react';
import { 
  LayoutDashboard, BookOpen, Target, Briefcase, GraduationCap, MessageSquare, FolderGit2, Settings, LogOut, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: BookOpen, label: 'ML/DL Roadmap', id: 'roadmap' },
  { icon: FolderGit2, label: 'Projects', id: 'projects' },
  { icon: Briefcase, label: 'Career Hub', id: 'career' },
  { icon: GraduationCap, label: 'Edu Navigator', id: 'edu' },
  { icon: Sparkles, label: 'AI Mentor', id: 'ai' },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 glass-dark border-r border-white/10 z-50 flex flex-col p-4 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyber-cyan flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Target className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-wider">NEXUS</h1>
          <p className="text-[10px] text-primary-400 font-medium tracking-widest uppercase">AI Student Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id
                ? "bg-primary-600/20 text-primary-400 border border-primary-500/30 shadow-sm shadow-primary-500/5"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}>
            <item.icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110", activeTab === item.id ? "text-primary-400" : "text-slate-500")} />
            <span className="font-medium text-sm">{item.label}</span>
            {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
        {/* Profile pill */}
        <button onClick={() => setActiveTab('settings')}
          className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === 'settings' ? "bg-primary-600/20 text-primary-400 border border-primary-500/30" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}>
          <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=4f46e5&color=fff&size=32`}
            alt="avatar" className="w-6 h-6 rounded-full" />
          <span className="font-medium text-sm flex-1 text-left truncate">{profile?.full_name || 'Settings'}</span>
          <Settings size={16} />
        </button>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
