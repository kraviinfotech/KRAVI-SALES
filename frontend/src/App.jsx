import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SellerLayout from './components/SellerLayout';
import ManagerLayout from './components/ManagerLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { CallProvider } from './context/CallProvider';
import Login from './pages/Login';
import AdminLogin from './pages/Admin/Login';
import Register from './pages/Register';
import { sellerRoutes } from './routes/sellerRoutes';
import { managerRoutes } from './routes/managerRoutes';
import { adminRoutes } from './routes/adminRoutes';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import bgImage from "./images/bg.png"; 
import KraviChatbot from './components/KraviChatbot';
import IncomingCallModal from './components/IncomingCallModal';
import CallWindow from './components/CallWindow';
import CallStatusToast from './components/CallStatusToast';

const renderRoutes = (routes) => routes.map((route) => {
  if (route.children) {
    return (
      <Route key={route.path} path={route.path} element={route.element}>
        {route.children.map((child) =>
          child.index ? (
            <Route key="index" index element={child.element} />
          ) : (
            <Route key={child.path} path={child.path} element={child.element} />
          )
        )}
      </Route>
    );
  }

  return <Route key={route.path} path={route.path} element={route.element} />;
});

const App = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1) Show loading spinner while auth state is being resolved
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const isSellerArea = user && user.role === 'seller' &&
    ['/dashboard', '/my-records', '/sell', '/seller/reports', '/seller/profile'].some((path) =>
      location.pathname.startsWith(path)
    );
  const isManagerArea = user && user.role === 'manager' && location.pathname.startsWith('/manager');
  const isAdminArea = user && user.role === 'admin' && location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  return (
    <CallProvider>
      <div className={isSellerArea || isManagerArea || isAdminArea ? 'min-h-screen bg-slate-100' : 'public-background flex flex-col min-h-screen bg-gray-50'} style={
        !(isSellerArea || isManagerArea || isAdminArea)
          ? {
            backgroundImage: `url(${bgImage})`,
          }
          : {}
      }>
      {!isSellerArea && !isManagerArea && !isAdminArea && <Navbar />}
      <main className={
        isSellerArea || isManagerArea || isAdminArea
          ? 'min-h-screen'
          : isLoginPage
            ? 'flex-1 w-full'
            : 'flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8'
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard'} replace />} />
          <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard'} replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard'} replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard') : '/login'} replace />} />

          {/* Seller Routes */}
          <Route element={
            <ProtectedRoute allowedRole="seller">
              <SellerLayout />
            </ProtectedRoute>
          }>
            {renderRoutes(sellerRoutes)}
          </Route>

          {/* Manager Routes */}
          <Route element={
            <ProtectedRoute allowedRole="manager">
              <ManagerLayout />
            </ProtectedRoute>
          }>
            {renderRoutes(managerRoutes)}
          </Route>

          {/* Admin Routes */}
          <Route element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            {renderRoutes(adminRoutes)}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard') : '/login'} replace />} />
        </Routes>
      </main>
    </div>
    <KraviChatbot />
    <IncomingCallModal />
    <CallWindow />
    <CallStatusToast />
  </CallProvider>
  );
};

export default App;
