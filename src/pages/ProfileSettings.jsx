import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Loader2, Upload } from 'lucide-react';

export default function ProfileSettings() {
  const { user, profile, updateProfile } = useAuth();
  const { uploadFile } = useData();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    goals: profile?.goals || 'AI Scientist specialization, Masters abroad via scholarship',
  });
  const [prefs, setPrefs] = useState(profile?.preferences || { theme: 'dark', notifications: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ ...form, preferences: prefs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      <header>
        <h2 className="text-3xl font-display font-bold text-white">Profile & Settings</h2>
        <p className="text-slate-400 mt-1">Manage your identity, goals, and AI configuration.</p>
      </header>

      {/* Avatar */}
      <div className="glass p-6 flex items-center gap-6">
        <label className="relative cursor-pointer group">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || 'User')}&background=4f46e5&color=fff&size=80`}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-500/30 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white drop-shadow-md text-xs font-bold">Upload</span>
          </div>
          <input type="file" accept="image/*" className="hidden" disabled={saving} onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) {
              alert("File is too large (max 2MB)");
              return;
            }

            setSaving(true);
            try {
              const ext = file.name.split('.').pop();
              const fileName = `avatar-${Date.now()}.${ext}`;
              const filePath = `${user.id}/${fileName}`;
              
              const { url, error } = await uploadFile('avatars', filePath, file);
              if (error) throw error;
              
              const { error: updateErr } = await updateProfile({ avatar_url: url });
              if (updateErr) throw updateErr;

              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            } catch (err) {
              console.error("Upload failed:", err);
              alert("Failed to upload image: " + (err.message || "Unknown error"));
            } finally {
              setSaving(false);
            }
          }} />
        </label>
        <div>
          <p className="font-bold text-white">{user?.email}</p>
          <p className="text-slate-400 text-sm">{profile?.full_name || 'Set your display name below'}</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Personal Information</h3>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Display Name</label>
          <input className="input-field" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Bio</label>
          <textarea className="input-field min-h-[80px] resize-none" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="CS student passionate about AI research..." />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Goals</label>
          <textarea className="input-field min-h-[80px] resize-none" value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} placeholder="AI Scientist specialization, Masters abroad via scholarship" />
        </div>
      </div>



      {/* Preferences */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Email Notifications</p>
            <p className="text-slate-400 text-sm">Receive goal reminders and updates</p>
          </div>
          <button
            onClick={() => setPrefs(p => ({ ...p, notifications: !p.notifications }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${prefs.notifications ? 'bg-primary-600' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.notifications ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
