import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, X, Upload, Download, FileText, Image, Archive, Loader2, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  'Planned': 'bg-slate-700/50 text-slate-300 border-slate-600',
  'In Progress': 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

function FileIcon({ type }) {
  if (type?.includes('image')) return <Image size={16} className="text-cyber-fuchsia" />;
  if (type?.includes('zip') || type?.includes('archive')) return <Archive size={16} className="text-cyber-amber" />;
  return <FileText size={16} className="text-primary-400" />;
}

function ProjectCard({ project, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: project.title, description: project.description || '', github_link: project.github_link || '', status: project.status });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const { user } = useAuth();

  const save = async () => {
    setSaving(true);
    await onUpdate(project.id, form);
    setSaving(false);
    setEditing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `${user.id}/${project.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error } = await supabase.storage.from('project-files').upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(path);
      await supabase.from('project_files').insert({ project_id: project.id, file_name: file.name, file_url: publicUrl, file_type: file.type });
      onUpdate(project.id, {}); // trigger re-fetch
    }
    setUploading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {editing ? (
            <div className="flex-1 space-y-3 mr-4">
              <input className="input-field py-2 font-bold" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project title" />
              <textarea className="input-field py-2 text-sm min-h-[60px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." />
              <input className="input-field py-2 text-sm font-mono" value={form.github_link} onChange={e => setForm(f => ({ ...f, github_link: e.target.value }))} placeholder="https://github.com/..." />
              <select className="input-field py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['Planned', 'In Progress', 'Completed'].map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>
          ) : (
            <div className="flex-1 mr-4">
              <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
              {project.description && <p className="text-slate-400 text-sm">{project.description}</p>}
              {project.github_link && (
                <a href={project.github_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary-400 text-sm mt-2 hover:text-primary-300 transition-colors">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg> View on GitHub
                </a>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${STATUS_STYLES[project.status]}`}>{project.status}</span>
            {editing ? (
              <>
                <button onClick={save} disabled={saving} className="p-1.5 bg-primary-600 rounded-lg text-white">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
                <button onClick={() => setEditing(false)} className="p-1.5 bg-white/10 rounded-lg text-slate-400"><X size={14} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors"><Edit3 size={16} /></button>
                <button onClick={() => onDelete(project.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
              </>
            )}
          </div>
        </div>

        {/* Files section */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">Files ({project.project_files?.length || 0})</span>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.zip,.doc,.docx" onChange={handleFileUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-600/20 border border-primary-500/30 rounded-lg text-primary-400 hover:bg-primary-600/30 transition-all">
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
          {project.project_files?.length > 0 && (
            <div className="space-y-2">
              {project.project_files.map(f => (
                <div key={f.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-sm">
                  <FileIcon type={f.file_type} />
                  <span className="flex-1 text-slate-300 truncate">{f.file_name}</span>
                  <a href={f.file_url} download={f.file_name} target="_blank" rel="noreferrer" className="p-1 text-slate-500 hover:text-primary-400 transition-colors"><Download size={14} /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AddProjectModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', github_link: '', status: 'Planned' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-dark p-8 rounded-2xl w-full max-w-lg space-y-4">
        <h3 className="text-xl font-bold text-white">New Project</h3>
        <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project title*" />
        <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." />
        <input className="input-field font-mono text-sm" value={form.github_link} onChange={e => setForm(f => ({ ...f, github_link: e.target.value }))} placeholder="GitHub link (optional)" />
        <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          {['Planned', 'In Progress', 'Completed'].map(s => <option key={s} className="bg-slate-900">{s}</option>)}
        </select>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving || !form.title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />} Create Project
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const { projects, loading, addProject, updateProject, deleteProject, fetchAll } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Projects</h2>
          <p className="text-slate-400 mt-1">Manage your AI/ML projects, files, and GitHub links.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 glass p-1 rounded-xl">
            {['All', 'Planned', 'In Progress', 'Completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filter === f ? 'bg-primary-600/30 text-primary-400' : 'text-slate-400 hover:text-slate-200'}`}>{f}</button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Project</button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-slate-400 mb-4">{filter === 'All' ? 'No projects yet.' : `No ${filter} projects.`}</p>
          {filter === 'All' && <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Create Your First Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p}
              onUpdate={async (id, updates) => { await updateProject(id, updates); await fetchAll(); }}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && <AddProjectModal onAdd={addProject} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}
