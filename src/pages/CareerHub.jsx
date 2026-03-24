import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, X, Building2, MapPin, GraduationCap, Languages, Loader2, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

function AddModal({ type, onAdd, onClose }) {
  const isCompany = type === 'company';
  const [form, setForm] = useState(isCompany
    ? { company_name: '', role: '', skills: '', status: 'Interested', notes: '' }
    : { name: '', program: '', min_gpa: '', requirements: '', deadline: '' }
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (isCompany) {
      await onAdd({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) });
    } else {
      await onAdd(form);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-dark p-8 rounded-2xl w-full max-w-lg space-y-4">
        <h3 className="text-xl font-bold text-white">{isCompany ? 'Add Company' : 'Add University'}</h3>
        {isCompany ? (
          <>
            <input className="input-field" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Company name*" />
            <input className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Target role" />
            <input className="input-field" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Required skills (comma-separated)" />
            <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Interested', 'Researching', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map(s => <option key={s} className="bg-slate-900">{s}</option>)}
            </select>
            <textarea className="input-field min-h-[80px] resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes..." />
          </>
        ) : (
          <>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="University name*" />
            <input className="input-field" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} placeholder="MS Program" />
            <input className="input-field" type="number" step="0.1" value={form.min_gpa} onChange={e => setForm(f => ({ ...f, min_gpa: e.target.value }))} placeholder="Minimum GPA (e.g. 3.8)" />
            <input className="input-field" value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder="Requirements (IELTS, GRE, etc.)" />
            <input className="input-field" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </>
        )}
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />} Add
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

const STATUS_COLORS = {
  'Interested': 'text-slate-400', 'Researching': 'text-cyber-amber', 'Applied': 'text-cyber-cyan',
  'Interviewing': 'text-primary-400', 'Offer': 'text-emerald-400', 'Rejected': 'text-rose-400',
};

export default function CareerHub() {
  const { careerGoals, universities, addCareerGoal, deleteCareerGoal, updateCareerGoal, addUniversity, deleteUniversity } = useData();
  const [activeTab, setActiveTab] = useState('companies');
  const [modal, setModal] = useState(null);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Career & Excellence Hub</h2>
          <p className="text-slate-400 mt-1">Strategic planning for your professional and academic future.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 glass p-1 rounded-2xl">
            <button onClick={() => setActiveTab('companies')} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'companies' ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-slate-200'}`}>Companies</button>
            <button onClick={() => setActiveTab('universities')} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'universities' ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-slate-200'}`}>Higher Education</button>
          </div>
          <button onClick={() => setModal(activeTab === 'companies' ? 'company' : 'university')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'companies' ? (
          <motion.div key="companies" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {careerGoals.length === 0 ? (
              <div className="glass p-16 text-center">
                <p className="text-slate-400 mb-4">No companies tracked yet.</p>
                <button className="btn-primary" onClick={() => setModal('company')}>+ Add Company</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerGoals.map(goal => (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 group hover:border-primary-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{goal.company_name}</h3>
                          <p className="text-sm text-primary-400">{goal.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={goal.status} onChange={e => updateCareerGoal(goal.id, { status: e.target.value })}
                          className={`bg-transparent text-xs font-bold cursor-pointer ${STATUS_COLORS[goal.status]}`}>
                          {['Interested', 'Researching', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                        </select>
                        <button onClick={() => deleteCareerGoal(goal.id)} className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {goal.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {goal.skills.map(s => <span key={s} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400">{s}</span>)}
                      </div>
                    )}
                    {goal.notes && <p className="text-slate-500 text-sm italic">{goal.notes}</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="universities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {universities.length === 0 ? (
              <div className="glass p-16 text-center">
                <p className="text-slate-400 mb-4">No universities tracked yet.</p>
                <button className="btn-primary" onClick={() => setModal('university')}>+ Add University</button>
              </div>
            ) : (
              <div className="glass overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-slate-500 text-xs uppercase tracking-widest border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">University & Program</th>
                      <th className="px-6 py-4">Min GPA</th>
                      <th className="px-6 py-4">Requirements</th>
                      <th className="px-6 py-4">Deadline</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {universities.map(uni => (
                      <tr key={uni.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <GraduationCap size={20} className="text-primary-500 flex-shrink-0" />
                            <div>
                              <p className="text-white font-bold">{uni.name}</p>
                              <p className="text-xs text-primary-400">{uni.program}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-500/20 font-bold">{uni.min_gpa || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">{uni.requirements || '—'}</td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{uni.deadline || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteUniversity(uni.id)} className="p-2 rounded-xl text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && <AddModal type={modal} onAdd={modal === 'company' ? addCareerGoal : addUniversity} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}
