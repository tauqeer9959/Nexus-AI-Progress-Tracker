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

  // Synchronize workspace access with authentication state
  React.useEffect(() => {
    if (user) {
      setInWorkspace(true);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Authenticating with NEXUS...</p>
        </div>
      </div>
    );
  }

  // Show Landing Page if not authorized AND not manually entering
  if (!user && !inWorkspace) {
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
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DataProvider>
      <Background3D />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} profile={profile}>
        <div className="relative z-10 pt-20">
          {renderContent()}
        </div>
        <ChatBot setActiveTab={setActiveTab} />
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
