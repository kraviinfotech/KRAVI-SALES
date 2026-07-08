import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SellerLayout from './components/SellerLayout';
import ManagerLayout from './components/ManagerLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/Admin/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/seller/SellerDashboard';
import MyRecords from './pages/seller/MyRecords';
import StartSelling from './pages/seller/StartSelling';
import AddShop from './pages/seller/AddShop';
import AddProducts from './pages/seller/AddProducts';
import ReviewSave from './pages/seller/ReviewSave';
import SellerReports from './pages/seller/SellerReports';
import SellerProfile from './pages/seller/SellerProfile';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import SubscriptionPayment from './pages/manager/SubscriptionPayment';
import AddSeller from './pages/manager/AddSeller';
import Reports from './pages/manager/Reports';
import ManagerRecords from './pages/manager/ManagerRecords';
import ProductsOverview from './pages/manager/ProductsOverview';
import ManagerSellerDetail from './pages/manager/ManagerSellerDetail';
import ManagerProfile from './pages/manager/ManagerProfile';
import ManagerNotifications from './pages/manager/ManagerNotifications';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCompanies from './pages/Admin/Companies';
import AdminManagers from './pages/Admin/Managers';
import AdminPlans from './pages/Admin/Plans';
import AdminPayments from './pages/Admin/Payments';
import AdminReports from './pages/Admin/Reports';
import AdminSettings from './pages/Admin/Settings';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import bgImage from "./images/bg.png"; 
import KraviChatbot from './components/KraviChatbot';
import SubscriptionBilling from './pages/manager/SubscriptionBilling';

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
    <>
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
            <Route path="/dashboard" element={<SellerDashboard />} />
            <Route path="/my-records" element={<MyRecords />} />
            <Route path="/seller/reports" element={<SellerReports />} />
            <Route path="/seller/profile" element={<SellerProfile />} />

            {/* Start Selling Visit Flow */}
            <Route path="/sell" element={<StartSelling />}>
              <Route path="shop" element={<AddShop />} />
              <Route path="products" element={<AddProducts />} />
              <Route path="review" element={<ReviewSave />} />
              <Route index element={<Navigate to="shop" replace />} />
            </Route>
          </Route>

          {/* Manager Routes */}
          <Route element={
            <ProtectedRoute allowedRole="manager">
              <ManagerLayout />
            </ProtectedRoute>
          }>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/payment" element={<SubscriptionPayment />} />
            <Route path="/manager/subscription" element={<SubscriptionBilling />} />
            <Route path="/manager/sellers" element={<AddSeller />} />
            <Route path="/manager/records" element={<ManagerRecords />} />
            <Route path="/manager/reports" element={<Reports />} />
            <Route path="/manager/products" element={<ProductsOverview />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
            <Route path="/manager/notifications" element={<ManagerNotifications />} />
            <Route path="/manager/seller/:sellerId" element={<ManagerSellerDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
              <Route path="/admin/managers" element={<AdminManagers />} /> 
              <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard') : '/login'} replace />} />
        </Routes>
      </main>
    </div>
    <KraviChatbot />
  </>
  );
};

export default App;
