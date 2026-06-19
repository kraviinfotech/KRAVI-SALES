import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from './admin/SuperAdminLayout';
import Dashboard from './admin/Dashboard';
import Plans from './admin/Plans';
import Payments from './admin/Payments';
import AddManagerForm from './admin/AddManagerForm';
import Settings from './admin/Settings';
// Using the role-based login and register pages from the pages folder
import Login from './frontend/src/pages/Login';
import Register from './frontend/src/pages/Register';

function App() {
  // Check if user was previously logged in
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isKraviAuth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isKraviAuth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isKraviAuth');
  };

  return (
    <Router>
      <Routes>
        {/* Authenticated user ko dashboard pe aur guest ko login pe bhejein */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/admin" : "/login"} replace />} />

        {/* Login route - agar user pehle se login hai toh seedha admin dashboard dikhaye */}
        <Route path="/login" element={
          !isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/admin" replace />
        } />
        
        {/* Register route - for Admin and Manager self-registration */}
        <Route path="/register" element={
          !isAuthenticated ? <Register /> : <Navigate to="/admin" replace />
        } />

        {isAuthenticated ? (
          <Route path="/*" element={
            <SuperAdminLayout onLogout={handleLogout}>
              <Routes>
                <Route index element={<Navigate to="/admin" replace />} />
                <Route path="admin" element={<Dashboard />} />
                <Route path="admin/plans" element={<Plans />} />
                <Route path="admin/payments" element={<Payments />} />
                <Route path="admin/managers" element={<div className="space-y-6"><AddManagerForm /></div>} />
                <Route path="admin/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </SuperAdminLayout>
          } />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;