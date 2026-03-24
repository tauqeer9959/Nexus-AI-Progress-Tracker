import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Award, Clock, ArrowUpRight, TrendingDown, Download, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="glass p-6 flex flex-col gap-4 group hover:border-primary-500/50 transition-all duration-500">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </motion.div>
);

export default function Dashboard({ setActiveTab }) {
  const { stats, roadmaps, projects } = useData();
  const { profile } = useAuth();

  const roadmapProgress = stats.totalTopics > 0
    ? Math.round((stats.completedTopics / stats.totalTopics) * 100)
    : 0;

  // Build skill data from roadmap topics
  const skillData = roadmaps.slice(0, 5).map(r => ({
    name: r.title.replace('Phase', 'P').split(':')[0].trim(),
    level: r.roadmap_topics?.length > 0
      ? Math.round((r.roadmap_topics.filter(t => t.completed).length / r.roadmap_topics.length) * 100)
      : 0,
  }));

  // Progress chart data (last 4 roadmap phases)
  const progressData = roadmaps.slice(0, 4).map((r, i) => ({
    name: `P${i + 1}`,
    progress: r.roadmap_topics?.length > 0
      ? Math.round((r.roadmap_topics.filter(t => t.completed).length / r.roadmap_topics.length) * 100)
      : 0,
  }));

  const handleDownloadTranscript = () => {
    const content = [
      '=== NEXUS Academic Transcript ===',
      `Student: ${profile?.full_name || 'User'}`,
      `Goals: ${profile?.goals || 'Not set'}`,
      '',
      '--- ML/DL Roadmap Progress ---',
      ...roadmaps.map(r => {
        const done = r.roadmap_topics?.filter(t => t.completed).length || 0;
        const total = r.roadmap_topics?.length || 0;
        return `${r.title}: ${done}/${total} topics completed`;
      }),
      '',
      '--- Projects ---',
      ...projects.map(p => `[${p.status}] ${p.title}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-display font-bold text-white">Student Command Center</h2>
        <p className="text-slate-400 mt-1">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Explorer'} — real-time overview of your academic journey.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Roadmap Progress" value={`${roadmapProgress}%`} change={roadmapProgress > 0 ? roadmapProgress : 0} icon={BookOpen} color="primary" />
        <StatCard title="Topics Completed" value={`${stats.completedTopics}/${stats.totalTopics}`} icon={TrendingUp} color="emerald" />
        <StatCard title="Total Projects" value={stats.totalProjects} icon={Award} color="cyber-amber" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={Clock} color="cyber-cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Learning Progress by Phase</h3>
            <button onClick={handleDownloadTranscript} className="text-primary-400 text-sm flex items-center gap-1 hover:text-primary-300 transition-colors">
              Download Transcript <Download size={14} />
            </button>
          </div>
          <div className="h-[280px] w-full">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="99.9%" height="100%" debounce={1}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#6366f1' }} />
                  <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No roadmap data yet. <button className="ml-2 text-primary-400 hover:underline" onClick={() => setActiveTab('roadmap')}>Add your first phase →</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skill Matrix */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8">
          <h3 className="text-xl font-bold text-white mb-8">Phase Progress</h3>
          <div className="space-y-5">
            {skillData.length > 0 ? skillData.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">{skill.name}</span>
                  <span className="text-primary-400 font-bold">{skill.level}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary-600 to-cyber-cyan"
                  />
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm">Start your roadmap to track skills.</p>
            )}
          </div>
          <button className="w-full mt-10 py-3 glass hover:bg-white/5 transition-all text-sm font-medium text-slate-300" onClick={() => setActiveTab('roadmap')}>
            Open Roadmap →
          </button>
        </motion.div>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Recent Projects</h3>
            <button className="text-primary-400 text-sm flex items-center gap-1 hover:text-primary-300" onClick={() => setActiveTab('projects')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="font-medium text-slate-200">{p.title}</span>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  p.status === 'In Progress' ? 'bg-cyber-cyan/10 text-cyber-cyan' :
                  'bg-slate-700 text-slate-400'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
