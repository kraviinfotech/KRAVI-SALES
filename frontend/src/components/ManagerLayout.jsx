import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const ManagerLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar onLogout={handleLogout} />
      <div className="md:pl-80">
        <main className="min-h-screen px-4 py-16 sm:px-6 md:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
