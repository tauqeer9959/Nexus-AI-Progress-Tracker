import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      // In a real app, this would call a secure edge function or check if profile.role === 'admin'
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { count: roadmaps } = await supabase.from('roadmaps').select('*', { count: 'exact', head: true });
      const { count: projects } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      const { count: career } = await supabase.from('career_goals').select('*', { count: 'exact', head: true });

      setUsers(profiles || []);
      setStats({
        users: profiles?.length || 0,
        roadmaps: roadmaps || 0,
        projects: projects || 0,
        careerGoals: career || 0,
      });
      setLoading(false);
    }
    fetchAdminData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-400" /></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-display font-bold text-white">Admin Dashboard</h2>
        <p className="text-slate-400 mt-1">Platform overview and user management.</p>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={24} className="text-primary-400" />} label="Total Users" value={stats.users} />
        <StatCard icon={<BookOpen size={24} className="text-cyber-cyan" />} label="Active Roadmaps" value={stats.roadmaps} />
        <StatCard icon={<Briefcase size={24} className="text-cyber-fuchsia" />} label="Tracked Projects" value={stats.projects} />
        <StatCard icon={<GraduationCap size={24} className="text-emerald-400" />} label="Career Goals" value={stats.careerGoals} />
      </div>

      {/* User List */}
      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Registered Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name || 'U'}`} alt="" className="w-8 h-8 rounded-full border border-primary-500/20" />
                      <div>
                        <p className="font-bold text-slate-200">{u.full_name || 'Anonymous'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${u.role === 'admin' ? 'bg-primary-500/10 text-primary-400 border-primary-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(u.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="p-8 text-center text-slate-500">No users found.</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass p-6 hover:border-primary-500/30 transition-colors pointer-events-none">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
