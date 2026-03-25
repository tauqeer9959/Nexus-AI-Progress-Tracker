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
  
  // Auto-redirect to workspace if user is already logged in
  React.useEffect(() => {
    if (user && !loading) {
      setInWorkspace(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-cyber-cyan flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-display font-bold text-lg">N</span>
          </div>
          <p className="text-slate-400 text-sm">Loading NEXUS...</p>
        </div>
      </div>
    );
  }

  // Always show Landing Page first. If logged in, LandingPage will show a 'Go to Dashboard' button.
  if (!inWorkspace) return <LandingPage onEnter={() => setInWorkspace(true)} />;

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
