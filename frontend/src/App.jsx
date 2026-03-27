import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Toast from './components/Toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// ── Google Fonts global load ──────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }
    a { text-decoration: none; }
    button { font-family: inherit; }
    select option { background: #161e2e; color: #e8edf5; }
  `}</style>
);

function App() {
  return (
    <AuthProvider>
      <FontLoader />
      <Router>
        <Routes>
          {/* Root → redirect based on auth state (handled in ProtectedRoute/GuestRoute) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Guest-only routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toast />
    </AuthProvider>
  );
}

// ── Simple 404 page ───────────────────────────────────────────────────────────
const NotFound = () => (
  <div style={{
    fontFamily: "'DM Sans', sans-serif",
    background: '#080c14', color: '#e8edf5',
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', flexDirection: 'column',
  }}>
    <div style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: 120, fontWeight: 800, letterSpacing: -4,
      background: 'linear-gradient(135deg, #4f8ef7, #7c5fe6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      lineHeight: 1, marginBottom: 24,
    }}>404</div>
    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Page not found</h1>
    <p style={{ color: '#6b7a99', marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
    <a href="/dashboard" style={{
      padding: '12px 28px', background: '#4f8ef7', color: 'white',
      borderRadius: 8, fontWeight: 500, fontSize: 14,
    }}>← Back to Dashboard</a>
  </div>
);

export default App;
