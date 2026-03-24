import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { supabase } from '../utils/supabase';

function buildSystemPrompt(profile, stats, roadmaps) {
  const completedPhases = roadmaps.filter(r => r.status === 'Completed').map(r => r.title).join(', ') || 'None yet';
  const inProgressPhase = roadmaps.find(r => r.status === 'In Progress')?.title || 'Not started';
  return `You are NEXUS AI Mentor — a specialized academic advisor for an ambitious CS student.

Student Profile:
- Name: ${profile?.full_name || 'User'}
- Goals: ${profile?.goals || 'AI Scientist, Masters abroad via scholarship'}
- Roadmap Progress: ${stats.completedTopics}/${stats.totalTopics} topics completed
- Current Phase: ${inProgressPhase}
- Completed Phases: ${completedPhases}

Your role:
1. Give personalized, actionable advice based on their actual progress
2. Suggest next steps, resources, and learning strategies
3. Help with career guidance (AI/ML companies, grad school applications)
4. Keep answers concise, motivating, and practical
5. Always reference their specific situation when possible`;
}

export default function AIMentor() {
  const { profile } = useAuth();
  const { stats, roadmaps, chatHistory, saveChatMessage, clearChatHistory } = useData();
  
  const INITIAL_MESSAGE = { role: 'assistant', content: `Hey ${profile?.full_name?.split(' ')[0] || 'Explorer'}! I'm your NEXUS AI Mentor. I know your roadmap progress and goals. Ask me anything — next study topics, career advice, grad school strategy, or motivation! 🚀` };
  const messages = chatHistory.length > 0 ? chatHistory : [INITIAL_MESSAGE];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setError(null);
    const userMsg = { role: 'user', content: input.trim(), time: new Date() };
    await saveChatMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(profile, stats, roadmaps);
      const history = messages.slice(-8).map(m => ({ type: m.role, text: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          systemPrompt,
          memory: history
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get response');
      }

      const data = await response.json();
      await saveChatMessage({ role: 'assistant', content: data.reply, time: new Date() });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['What should I study next?', 'How do I prepare for a Masters abroad?', 'Which ML skills am I missing?', 'Recommend resources for my current phase'];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] pb-4">
      <header className="mb-6">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Sparkles className="text-primary-400" size={28} /> AI Mentor
        </h2>
        <p className="text-slate-400 mt-1">Powered by Groq · Context-aware responses based on your progress.</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-primary-600/30 border border-primary-500/30' : 'bg-cyber-cyan/20 border border-cyber-cyan/30'}`}>
              {msg.role === 'assistant' ? <Bot size={16} className="text-primary-400" /> : <User size={16} className="text-cyber-cyan" />}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'glass text-slate-200' : 'bg-primary-600/20 border border-primary-500/30 text-primary-100'}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-primary-600/30 border border-primary-500/30">
              <Bot size={16} className="text-primary-400" />
            </div>
            <div className="glass px-4 py-3 rounded-2xl">
              <Loader2 size={16} className="animate-spin text-primary-400" />
            </div>
          </div>
        )}
        {error && (
          <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only when few messages) */}
      {messages.length < 3 && (
        <div className="flex flex-wrap gap-2 my-3">
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 mt-3">
        <input
          className="input-field flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask your AI mentor anything..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 rounded-xl text-white transition-all active:scale-95">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
        <button onClick={() => clearChatHistory()} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Clear chat">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
