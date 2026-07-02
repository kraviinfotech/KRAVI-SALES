import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = {
  admin: '/admin',
  manager: '/manager',
  seller: '/dashboard',
};

/**
 * ProtectedRoute component to handle Role-Based Access Control (RBAC)
 * @param {String|Array} allowedRole - String or array of allowed roles (e.g., 'admin' or ['admin', 'manager'])
 */
const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
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

  // Support both allowedRole (string) and allowedRoles (array)
  const roles = allowedRoles ? (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]) : (allowedRole ? (typeof allowedRole === 'string' ? [allowedRole] : allowedRole) : []);

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={ROLE_REDIRECTS[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;