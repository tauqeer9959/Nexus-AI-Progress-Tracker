import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, User, Sparkles,
  Loader2, Minimize2, Trash2
} from 'lucide-react';
import { useData } from '../context/DataContext';

function formatTime(date) {
  // Defensive check in case 'date' is string from DB
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm your NEXUS AI Mentor 🚀 Ask me anything about ML/DL, your roadmap, career planning, or grad school strategy!",
  time: new Date(),
};

export default function ChatBot() {
  const { chatHistory = [], saveChatMessage, clearChatHistory } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const messages = chatHistory.length > 0 ? chatHistory : [INITIAL_MESSAGE];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);

    const userMsg = { role: 'user', content: input.trim(), time: new Date() };
    await saveChatMessage(userMsg);
    
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      await saveChatMessage({
        role: 'assistant',
        content: data.reply,
        time: new Date(),
      });
    } catch (err) {
      const errMsg = err.message || 'Connection failed. Is the API server running?';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setError(null);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass flex flex-col mb-4 overflow-hidden border-primary-500/30"
            style={{ width: 'min(400px, calc(100vw - 2rem))', height: 'min(580px, calc(100vh - 8rem))' }}
          >
            {/* ─── Header ─── */}
            <div className="p-4 bg-gradient-to-r from-primary-600/90 to-cyber-cyan/90 backdrop-blur-md flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">NEXUS AI MENTOR</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-white/70">
                      {isLoading ? 'Typing...' : 'Online'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear chat"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ─── Messages ─── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border ${
                      msg.role === 'user'
                        ? 'bg-primary-600/20 border-primary-500/20 text-primary-400'
                        : msg.isError
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                        : 'bg-white/10 border-white/10 text-cyber-cyan'
                    }`}>
                      {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-500/20'
                          : msg.isError
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-tl-none'
                          : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      {msg.time && (
                        <span className={`text-[10px] text-slate-600 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.time)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-cyber-cyan flex items-center justify-center">
                      <Loader2 size={13} className="animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Input ─── */}
            <div className="p-4 bg-black/60 border-t border-white/10 flex-shrink-0">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask NEXUS anything..."
                  disabled={isLoading}
                  maxLength={2000}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all disabled:opacity-40 active:scale-90"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-600 mt-2 font-medium tracking-tight">
                AI can make mistakes · Verify important academic info
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-cyber-cyan shadow-[0_8px_32px_0_rgba(99,102,241,0.4)] flex items-center justify-center text-white relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <Minimize2 size={26} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
              <MessageSquare size={26} />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#020617] animate-bounce"
          />
        )}
      </motion.button>
    </div>
  );
}
