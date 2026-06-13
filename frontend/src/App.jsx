import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SellerLayout from './components/SellerLayout';
import ManagerLayout from './components/ManagerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MyRecords from './pages/MyRecords';
import StartSelling from './pages/StartSelling';
import AddShop from './pages/AddShop';
import AddProducts from './pages/AddProducts';
import ReviewSave from './pages/ReviewSave';
import SellerReports from './pages/SellerReports';
import SellerProfile from './pages/SellerProfile';
import AddSeller from './pages/AddSeller';
import Reports from './pages/Reports';
import ManagerRecords from './pages/ManagerRecords';
import ProductsOverview from './pages/ProductsOverview';
import ManagerSellerDetail from './pages/ManagerSellerDetail';
import ManagerProfile from './pages/ManagerProfile';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import bgImage from "./images/bg.png"; 

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

  return (
    <div className={isSellerArea || isManagerArea ? 'min-h-screen bg-slate-100' : 'flex flex-col min-h-screen bg-gray-50'} style={
      !(isSellerArea || isManagerArea)
        ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
        : {}
    }>
      {!isSellerArea && !isManagerArea && <Navbar />}
      <main className={isSellerArea || isManagerArea ? 'min-h-screen' : 'flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/" element={<Navigate to={user ? (user.role === 'manager' ? '/manager' : '/dashboard') : '/login'} replace />} />

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
            <Route path="/manager/sellers" element={<AddSeller />} />
            <Route path="/manager/records" element={<ManagerRecords />} />
            <Route path="/manager/reports" element={<Reports />} />
            <Route path="/manager/products" element={<ProductsOverview />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
            <Route path="/manager/seller/:sellerId" element={<ManagerSellerDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? (user.role === 'manager' ? '/manager' : '/dashboard') : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
