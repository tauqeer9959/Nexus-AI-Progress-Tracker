import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, Menu, Clock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { profile, user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem(`search_history_${user?.id}`) || '[]');
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.trim();
      const updated = [query, ...searchHistory.filter(q => q !== query)].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem(`search_history_${user?.id}`, JSON.stringify(updated));
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(`search_history_${user?.id}`);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=40`;

  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Roadmap Updated', desc: 'You completed a new topic!', time: '2m ago', unread: true },
    { id: 2, title: 'AI Mentor', desc: 'Your generated learning plan is ready.', time: '1h ago', unread: true },
    { id: 3, title: 'Welcome to NEXUS', desc: 'Secure your first goal to get started.', time: '1d ago', unread: false },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 glass border-b border-white/10 z-30 px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <button onClick={onMenuToggle} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <Menu size={24} />
        </button>

        <div ref={searchRef} className="relative w-full max-w-sm hidden sm:block">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showSearchDropdown ? 'text-primary-400' : 'text-slate-500'}`} size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search resources... (Press Enter)"
            className={`w-full bg-white/5 border rounded-full pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none transition-all font-medium ${showSearchDropdown ? 'border-primary-500/50 bg-white/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-white/10'}`}
          />

          {/* Search History Dropdown */}
          {showSearchDropdown && searchHistory.length > 0 && (
            <div className="absolute top-12 left-0 w-full glass border border-white/10 rounded-2xl py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Searches</span>
                <button onClick={clearSearchHistory} className="text-xs text-rose-400 hover:text-rose-300">Clear</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchHistory.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(query);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors group"
                  >
                    <Clock size={14} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-primary-400 hover:border-primary-500/30 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyber-rose rounded-full border-2 border-[#020617]" />
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2" onMouseLeave={() => setShowNotifications(false)}>
              <div className="px-4 py-2 border-b border-white/10">
                <h4 className="text-white font-bold text-sm">Notifications</h4>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 ${n.unread ? 'border-primary-500 bg-primary-500/5' : 'border-transparent'}`}>
                    <p className="text-sm font-bold text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-10 w-[1px] bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{profile?.bio?.slice(0, 20) || 'CS Student'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-primary-600 p-[1px]">
            <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-[11px] object-cover" />
          </div>
          <button onClick={signOut} className="ml-2 p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
