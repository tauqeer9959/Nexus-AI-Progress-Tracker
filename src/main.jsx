import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error boundary for uncaught errors
class RootErrorBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f87171' }}>App Failed to Load</h1>
          <p style={{ color: '#94a3b8', maxWidth: '500px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
            💡 Most likely fix: create a <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>.env</code> file with your Supabase credentials. See <code>.env.example</code>.
          </p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: '#4f46e5', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
)
