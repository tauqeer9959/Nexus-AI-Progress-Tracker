import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [careerGoals, setCareerGoals] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if Supabase is properly initialized with a URL and Key
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setRoadmaps([]);
      setProjects([]);
      setCareerGoals([]);
      setUniversities([]);
      setChatHistory([]);
      return;
    }
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const [rm, pr, cg, uni, chats] = await Promise.all([
          supabase.from('roadmaps').select('*, roadmap_topics(*)').eq('user_id', user.id).order('order_index'),
          supabase.from('projects').select('*, project_files(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('career_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('universities').select('*').eq('user_id', user.id).order('deadline'),
          supabase.from('ai_chats').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        ]);

        setRoadmaps(rm.data || []);
        setProjects(pr.data || []);
        setCareerGoals(cg.data || []);
        setUniversities(uni.data || []);
        
        if (chats.data) {
          setChatHistory(chats.data.map(c => ({
            role: c.role,
            content: c.message,
            time: new Date(c.created_at)
          })));
        }
      } else {
        // Local Fallback if Supabase is not configured
        const savedRoadmaps = localStorage.getItem(`roadmaps_${user.id}`);
        if (savedRoadmaps) setRoadmaps(JSON.parse(savedRoadmaps));

        const savedProjects = localStorage.getItem(`projects_${user.id}`);
        if (savedProjects) setProjects(JSON.parse(savedProjects));

        const savedChats = localStorage.getItem(`chats_${user.id}`);
        if (savedChats) setChatHistory(JSON.parse(savedChats));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isSupabaseConfigured]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Roadmap CRUD
  const addRoadmap = async (phase) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('roadmaps').insert({ user_id: user.id, ...phase }).select('*, roadmap_topics(*)').single();
      if (data) setRoadmaps(prev => [...prev, data]);
      return data;
    }
  };
  const updateRoadmap = async (id, updates) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('roadmaps').update(updates).eq('id', id).select('*, roadmap_topics(*)').single();
      if (data) setRoadmaps(prev => prev.map(r => r.id === id ? data : r));
      return data;
    }
  };
  const deleteRoadmap = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('roadmaps').delete().eq('id', id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
    }
  };

  const addTopic = async (roadmapId, topic) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('roadmap_topics').insert({ roadmap_id: roadmapId, ...topic }).select().single();
      if (data) setRoadmaps(prev => prev.map(r => r.id === roadmapId ? { ...r, roadmap_topics: [...(r.roadmap_topics || []), data] } : r));
      return data;
    }
  };
  const updateTopic = async (topicId, roadmapId, updates) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('roadmap_topics').update(updates).eq('id', topicId).select().single();
      if (data) setRoadmaps(prev => prev.map(r => r.id === roadmapId ? { ...r, roadmap_topics: r.roadmap_topics.map(t => t.id === topicId ? data : t) } : r));
      return data;
    }
  };
  const deleteTopic = async (topicId, roadmapId) => {
    if (isSupabaseConfigured) {
      await supabase.from('roadmap_topics').delete().eq('id', topicId);
      setRoadmaps(prev => prev.map(r => r.id === roadmapId ? { ...r, roadmap_topics: r.roadmap_topics.filter(t => t.id !== topicId) } : r));
    }
  };

  // Projects CRUD
  const addProject = async (project) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('projects').insert({ user_id: user.id, ...project }).select('*, project_files(*)').single();
      if (data) setProjects(prev => [data, ...prev]);
      return data;
    }
  };
  const updateProject = async (id, updates) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('projects').update(updates).eq('id', id).select('*, project_files(*)').single();
      if (data) setProjects(prev => prev.map(p => p.id === id ? data : p));
      return data;
    }
  };
  const deleteProject = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('projects').delete().eq('id', id);
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  // Chat History
  const saveChatMessage = async (msg) => {
    const newMsg = { ...msg, time: msg.time || new Date() };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);

    if (user) {
      if (isSupabaseConfigured) {
        await supabase.from('ai_chats').insert([{
          user_id: user.id,
          message: newMsg.content,
          role: newMsg.role,
          created_at: newMsg.time.toISOString()
        }]);
      } else {
        localStorage.setItem(`chats_${user.id}`, JSON.stringify(updatedHistory));
      }
    }
  };

  const clearChatHistory = async () => {
    setChatHistory([]);
    if (user) {
      if (isSupabaseConfigured) {
        await supabase.from('ai_chats').delete().eq('user_id', user.id);
      } else {
        localStorage.removeItem(`chats_${user.id}`);
      }
    }
  };

  // File upload
  const uploadFile = async (bucket, path, file) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) return { error };
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      return { url: publicUrl };
    }
    return { error: 'Supabase storage not configured' };
  };

  // Career CRUD
  const addCareerGoal = async (goal) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('career_goals').insert({ user_id: user.id, ...goal }).select().single();
      if (data) setCareerGoals(prev => [data, ...prev]);
      return data;
    }
  };

  // University CRUD
  const addUniversity = async (uni) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('universities').insert({ user_id: user.id, ...uni }).select().single();
      if (data) setUniversities(prev => [...prev, data]);
      return data;
    }
  };

  // Stats derived from data
  const stats = {
    totalTopics: roadmaps.reduce((a, r) => a + (r.roadmap_topics?.length || 0), 0),
    completedTopics: roadmaps.reduce((a, r) => a + (r.roadmap_topics?.filter(t => t.completed).length || 0), 0),
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'In Progress').length,
  };

  return (
    <DataContext.Provider value={{
      roadmaps, projects, careerGoals, universities, chatHistory, loading, stats, 
      fetchAll, addRoadmap, updateRoadmap, deleteRoadmap, addTopic, updateTopic, deleteTopic,
      addProject, updateProject, deleteProject, saveChatMessage, clearChatHistory, uploadFile,
      addCareerGoal, addUniversity,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
