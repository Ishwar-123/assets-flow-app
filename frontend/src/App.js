import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup';
import AssetDirectory from './pages/AssetDirectory';
import Allocation from './pages/Allocation';
import Maintenance from './pages/Maintenance';
import Audit from './pages/Audit';
import Booking from './pages/Booking';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div className="flex flex-col h-screen w-screen select-none overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Main Layout Grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar />
        {/* Workspace panel */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ background: 'var(--bg-app)' }}>
          {/* Header toolbar */}
          <Header />
          {/* Child route viewport */}
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col relative" style={{ background: 'var(--bg-app)' }}>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/organization" element={<ProtectedRoute><OrganizationSetup /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetDirectory /></ProtectedRoute>} />
          <Route path="/allocations" element={<ProtectedRoute><Allocation /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
          <Route path="/audits" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
