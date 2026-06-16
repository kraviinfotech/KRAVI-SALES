import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to handle Role-Based Access Control (RBAC)
 * @param {Array} allowedRoles - Array of strings (e.g., ['admin', 'manager'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized for this specific role, send them to their allowed dashboard
    const roleRedirects = {
      admin: '/admin',
      manager: '/manager',
      seller: '/dashboard'
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;