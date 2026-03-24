import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, X, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';

const STATUS_COLORS = {
  'Completed': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  'In Progress': 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10',
  'Locked': 'text-slate-500 border-slate-700 bg-slate-800/50',
};

function TopicRow({ topic, roadmapId, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: topic.name, resource_url: topic.resource_url || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(topic.id, roadmapId, form);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group">
      <button onClick={() => onUpdate(topic.id, roadmapId, { completed: !topic.completed })}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${topic.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 hover:border-primary-400'}`}>
        {topic.completed && <Check size={12} className="text-white" />}
      </button>
      {editing ? (
        <div className="flex-1 flex gap-2">
          <input className="input-field py-1 text-sm flex-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="input-field py-1 text-sm flex-1" value={form.resource_url} onChange={e => setForm(f => ({ ...f, resource_url: e.target.value }))} placeholder="Resource URL..." />
          <button onClick={save} disabled={saving} className="p-1.5 bg-primary-600 rounded-lg text-white">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
          <button onClick={() => setEditing(false)} className="p-1.5 bg-white/10 rounded-lg text-slate-400"><X size={14} /></button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-sm ${topic.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{topic.name}</span>
          {topic.resource_url && (
            <a href={topic.resource_url} target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors">
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-200 transition-all"><Edit3 size={14} /></button>
          <button onClick={() => onDelete(topic.id, roadmapId)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
        </>
      )}
    </div>
  );
}

function PhaseCard({ phase, onUpdate, onDelete, onAddTopic, onUpdateTopic, onDeleteTopic }) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(phase.title);
  const [newTopic, setNewTopic] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);
  const [saving, setSaving] = useState(false);

  const topics = phase.roadmap_topics || [];
  const completedCount = topics.filter(t => t.completed).length;
  const progress = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  const saveTitle = async () => {
    setSaving(true);
    await onUpdate(phase.id, { title });
    setSaving(false);
    setEditingTitle(false);
  };

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    setAddingTopic(true);
    await onAddTopic(phase.id, { name: newTopic.trim() });
    setNewTopic('');
    setAddingTopic(false);
  };

  const statusOptions = ['Locked', 'In Progress', 'Completed'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden">
      {/* Header */}
      <div className="bg-white/5 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-primary-500 font-display font-bold text-sm w-8">{String(phase.order_index || 1).padStart(2, '0')}</span>
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input className="input-field py-1.5 text-sm flex-1" value={title} onChange={e => setTitle(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveTitle()} />
                <button onClick={saveTitle} disabled={saving} className="p-1.5 bg-primary-600 rounded-lg text-white">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
                <button onClick={() => setEditingTitle(false)} className="p-1.5 bg-white/10 rounded-lg text-slate-400"><X size={14} /></button>
              </div>
            ) : (
              <h3 className="text-lg font-bold text-white cursor-pointer hover:text-primary-300 transition-colors" onClick={() => setEditingTitle(true)}>
                {phase.title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select value={phase.status} onChange={e => onUpdate(phase.id, { status: e.target.value })}
              className="bg-transparent text-xs font-bold px-2 py-1 rounded-md border cursor-pointer"
              style={{ ...STATUS_COLORS[phase.status] ? {} : {} }}>
              {statusOptions.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
            </select>
            <button onClick={() => onDelete(phase.id)} className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-400"><ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-600 to-cyber-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-400">{completedCount}/{topics.length}</span>
        </div>
      </div>

      {/* Topics */}
      {expanded && (
        <div className="p-6 space-y-3">
          {topics.map(topic => (
            <TopicRow key={topic.id} topic={topic} roadmapId={phase.id} onUpdate={onUpdateTopic} onDelete={onDeleteTopic} />
          ))}
          {/* Add topic */}
          <div className="flex gap-2 pt-2">
            <input
              className="input-field py-2 text-sm flex-1" value={newTopic}
              onChange={e => setNewTopic(e.target.value)} placeholder="Add a topic..."
              onKeyDown={e => e.key === 'Enter' && addTopic()}
            />
            <button onClick={addTopic} disabled={addingTopic || !newTopic.trim()} className="p-2 bg-primary-600/20 border border-primary-500/30 rounded-lg text-primary-400 hover:bg-primary-600/30 transition-all disabled:opacity-40">
              {addingTopic ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Roadmap() {
  const { roadmaps, loading, addRoadmap, updateRoadmap, deleteRoadmap, addTopic, updateTopic, deleteTopic } = useData();
  const [adding, setAdding] = useState(false);

  const handleAddPhase = async () => {
    setAdding(true);
    await addRoadmap({ title: 'New Phase', status: 'Locked', order_index: roadmaps.length + 1 });
    setAdding(false);
  };

  const overallProgress = roadmaps.reduce((a, r) => {
    const topics = r.roadmap_topics || [];
    const done = topics.filter(t => t.completed).length;
    return a + (topics.length > 0 ? (done / topics.length) : 0);
  }, 0) / (roadmaps.length || 1) * 100;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">ML/DL Learning Journey</h2>
          <p className="text-slate-400 mt-1">Your fully editable path from beginner to AI Architect.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 text-sm text-slate-300">
            Overall: <span className="text-primary-400 font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <button onClick={handleAddPhase} disabled={adding} className="btn-primary flex items-center gap-2">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Phase
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-400" /></div>
      ) : roadmaps.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-slate-400 mb-4">No roadmap phases yet. Start building your learning journey!</p>
          <button onClick={handleAddPhase} className="btn-primary">+ Add Your First Phase</button>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmaps.map(phase => (
            <PhaseCard key={phase.id} phase={phase}
              onUpdate={updateRoadmap} onDelete={deleteRoadmap}
              onAddTopic={addTopic} onUpdateTopic={updateTopic} onDeleteTopic={deleteTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
