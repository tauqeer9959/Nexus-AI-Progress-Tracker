import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PATHS = [
  {
    category: 'Mathematics',
    icon: '∑',
    color: 'primary',
    topics: [
      { name: 'Linear Algebra', resource: 'MIT OCW 18.06', url: 'https://ocw.mit.edu/18-06' },
      { name: 'Probability & Statistics', resource: 'StatQuest YouTube', url: 'https://youtube.com/@statquest' },
    ],
  },
  {
    category: 'Machine Learning',
    icon: '🤖',
    color: 'emerald',
    topics: [
      { name: 'Supervised Learning', resource: "Andrew Ng's ML", url: 'https://deeplearning.ai' },
    ],
  }
];

export default function EduNavigator() {
  const { user } = useAuth();
  const storageKey = `edu_paths_${user?.id || 'guest'}`;
  
  const [paths, setPaths] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : DEFAULT_PATHS;
  });

  const [editingCategory, setEditingCategory] = useState(null); // index or 'new'
  const [editingTopic, setEditingTopic] = useState(null); // { catIdx, topicIdx } or { catIdx, topicIdx: 'new' }
  
  const [catForm, setCatForm] = useState({ category: '', icon: '📚' });
  const [topicForm, setTopicForm] = useState({ name: '', resource: '', url: '' });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(paths));
  }, [paths, storageKey]);

  // --- Category CRUD ---
  const handleSaveCategory = (idx) => {
    if (!catForm.category.trim()) return;
    const newPaths = [...paths];
    if (idx === 'new') {
      newPaths.push({ ...catForm, color: 'primary', topics: [] });
    } else {
      newPaths[idx] = { ...newPaths[idx], ...catForm };
    }
    setPaths(newPaths);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (idx) => {
    if (window.confirm('Delete this entire domain and all its topics?')) {
      setPaths(paths.filter((_, i) => i !== idx));
    }
  };

  // --- Topic CRUD ---
  const handleSaveTopic = (catIdx, topIdx) => {
    if (!topicForm.name.trim() || !topicForm.resource.trim()) return;
    const newPaths = [...paths];
    
    // Ensure URL has protocol
    let finalUrl = topicForm.url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const payload = { ...topicForm, url: finalUrl };

    if (topIdx === 'new') {
      newPaths[catIdx].topics.push(payload);
    } else {
      newPaths[catIdx].topics[topIdx] = payload;
    }
    setPaths(newPaths);
    setEditingTopic(null);
  };

  const handleDeleteTopic = (catIdx, topIdx) => {
    if (window.confirm('Delete this resource?')) {
      const newPaths = [...paths];
      newPaths[catIdx].topics.splice(topIdx, 1);
      setPaths(newPaths);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Edu Navigator</h2>
          <p className="text-slate-400 mt-1">Curate and manage your ultimate learning resources. Fully editable.</p>
        </div>
        <button 
          onClick={() => { setCatForm({ category: '', icon: '📚' }); setEditingCategory('new'); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-95"
        >
          <Plus size={18} />
          <span className="font-bold text-sm">Add Domain</span>
        </button>
      </header>

      {/* New Category Inline Form */}
      <AnimatePresence>
        {editingCategory === 'new' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="glass p-6 rounded-2xl border-primary-500/30">
            <h3 className="text-white font-bold mb-4">Create New Domain</h3>
            <div className="flex gap-4">
              <input type="text" value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} placeholder="Icon (e.g. 🤖)" className="w-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center text-xl focus:border-primary-500 outline-none" maxLength={2} />
              <input type="text" value={catForm.category} onChange={e => setCatForm({...catForm, category: e.target.value})} placeholder="Domain Name (e.g. Cloud Computing)" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary-500 outline-none" autoFocus />
              <button onClick={() => handleSaveCategory('new')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-colors"><Save size={20} /></button>
              <button onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl transition-colors"><X size={20} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {paths.map((path, catIdx) => (
          <motion.div key={catIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }} className="glass overflow-hidden flex flex-col group/domain">
            
            {/* Domain Header */}
            {editingCategory === catIdx ? (
              <div className="bg-primary-900/40 px-6 py-4 border-b border-primary-500/30 flex items-center gap-3">
                <input type="text" value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} className="w-12 bg-black/40 border border-white/10 rounded-lg text-center text-lg outline-none text-white focus:border-primary-500" maxLength={2} />
                <input type="text" value={catForm.category} onChange={e => setCatForm({...catForm, category: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-white outline-none focus:border-primary-500" autoFocus />
                <button onClick={() => handleSaveCategory(catIdx)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"><Save size={16} /></button>
                <button onClick={() => setEditingCategory(null)} className="p-1.5 text-slate-400 hover:bg-white/10 rounded-lg"><X size={16} /></button>
              </div>
            ) : (
              <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center gap-4 relative">
                <span className="text-2xl">{path.icon}</span>
                <h3 className="text-lg font-bold text-white tracking-wide">{path.category}</h3>
                
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/domain:opacity-100 transition-opacity">
                  <button onClick={() => { setCatForm({ category: path.category, icon: path.icon }); setEditingCategory(catIdx); }} className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteCategory(catIdx)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            )}

            {/* Topics List */}
            <div className="p-6 space-y-3 flex-1 flex flex-col">
              {path.topics.map((topic, topIdx) => (
                <div key={topIdx}>
                  {editingTopic?.catIdx === catIdx && editingTopic?.topicIdx === topIdx ? (
                    <div className="flex flex-col gap-2 glass-dark p-4 rounded-xl border border-primary-500/30">
                      <input type="text" value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} placeholder="Topic Name (e.g. Neural Networks)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary-500" autoFocus />
                      <div className="flex gap-2">
                        <input type="text" value={topicForm.resource} onChange={e => setTopicForm({...topicForm, resource: e.target.value})} placeholder="Source (e.g. YouTube)" className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-primary-500" />
                        <input type="text" value={topicForm.url} onChange={e => setTopicForm({...topicForm, url: e.target.value})} placeholder="URL (optional)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-primary-500" />
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button onClick={() => setEditingTopic(null)} className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-white/5 rounded-lg">Cancel</button>
                        <button onClick={() => handleSaveTopic(catIdx, topIdx)} className="px-3 py-1 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between glass-dark p-4 rounded-xl group/topic hover:border-primary-500/20 transition-all border border-transparent">
                      <div>
                        <p className="font-medium text-slate-200 text-sm">{topic.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <BookOpen size={12} />
                          <span>{topic.resource}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/topic:opacity-100 transition-opacity">
                        <button onClick={() => { setTopicForm(topic); setEditingTopic({ catIdx, topicIdx: topIdx }); }} className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteTopic(catIdx, topIdx)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 size={14} /></button>
                        {topic.url && (
                          <a href={topic.url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 rounded-lg ml-1 border-l border-white/10 pl-2">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Topic Field inline */}
              {editingTopic?.catIdx === catIdx && editingTopic?.topicIdx === 'new' ? (
                <div className="flex flex-col gap-2 glass-dark p-4 rounded-xl border border-primary-500/30 mt-auto">
                  <input type="text" value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} placeholder="Topic Name (e.g. Neural Networks)" className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary-500" autoFocus />
                  <div className="flex gap-2">
                    <input type="text" value={topicForm.resource} onChange={e => setTopicForm({...topicForm, resource: e.target.value})} placeholder="Source (e.g. YouTube)" className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-primary-500" />
                    <input type="text" value={topicForm.url} onChange={e => setTopicForm({...topicForm, url: e.target.value})} placeholder="URL (optional)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-primary-500" />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => setEditingTopic(null)} className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-white/5 rounded-lg">Cancel</button>
                    <button onClick={() => handleSaveTopic(catIdx, 'new')} className="px-3 py-1 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg font-bold">Add Topic</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => { setTopicForm({ name: '', resource: '', url: '' }); setEditingTopic({ catIdx, topicIdx: 'new' }); }}
                  className="mt-auto pt-3 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-400 transition-colors group/add"
                >
                  <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center group-hover/add:bg-primary-500/20 transition-colors">
                    <Plus size={12} />
                  </div>
                  Add new resource
                </button>
              )}
            </div>
            
          </motion.div>
        ))}
      </div>
    </div>
  );
}
