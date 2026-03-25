import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Projects from './pages/Projects';
import CareerHub from './pages/CareerHub';
import EduNavigator from './pages/EduNavigator';
import AIMentor from './pages/AIMentor';
import ProfileSettings from './pages/ProfileSettings';
import Admin from './pages/Admin';
import Background3D from './components/Background3D';
import ChatBot from './components/ChatBot';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inWorkspace, setInWorkspace] = useState(false);

  // Handle URL Redirection without clearing history immediately
  React.useEffect(() => {
    const isDashboardPath = window.location.pathname === '/dashboard';
    
    if (isDashboardPath && user) {
      console.log('[NEXUS] User on dashboard path and authorized, setting workspace.');
      setInWorkspace(true);
    }
  }, [user]);

  // If user is already logged in, we should be in the workspace (Dashboard)
  // We use user session as the source of truth for current state
  const isAuthorized = !!user;

  console.log('[NEXUS] Redirection Diagnostics:', {
    userLoggedIn: isAuthorized,
    email: user?.email,
    inWorkspace: inWorkspace,
    loading: loading,
    path: window.location.pathname
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-cyber-cyan flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-display font-bold text-lg">N</span>
          </div>
          <p className="text-slate-400 text-sm">Authenticating with NEXUS...</p>
        </div>
      </div>
    );
  }

  // Final check: if no user and they haven't manually clicked 'Enter', show Landing
  if (!isAuthorized && !inWorkspace) {
    return <LandingPage onEnter={() => setInWorkspace(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'roadmap': return <Roadmap />;
      case 'projects': return <Projects />;
      case 'career': return <CareerHub />;
      case 'edu': return <EduNavigator />;
      case 'ai': return <AIMentor />;
      case 'settings': return <ProfileSettings />;
      case 'admin': 
        return profile?.role === 'admin' ? <Admin /> : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-3xl font-display font-bold text-rose-500 mb-4">Access Denied</h2>
            <p className="text-slate-400 max-w-md">You do not have permission to view the admin dashboard.</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-slate-400 max-w-md">This section is under construction. Check back soon!</p>
          </div>
        );
    }
  };

  return (
    <DataProvider>
      <Background3D />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
        <ChatBot />
      </Layout>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
