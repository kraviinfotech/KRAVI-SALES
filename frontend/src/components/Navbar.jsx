import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, BarChart3, Users, PlusCircle, History, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Records', path: '/my-records', icon: History },
  ];

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-wider">⚡ SALESFLOW</span>
            </Link>
            <div className="hidden md:flex space-x-4 ml-10">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-dark text-white'
                        : 'hover:bg-primary-light hover:text-white text-blue-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-blue-200 capitalize">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-dark focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-primary-dark px-2 pt-2 pb-4 space-y-1 bg-primary">
          <div className="px-3 py-2 border-b border-primary-dark mb-2">
            <div className="text-base font-semibold">{user.name}</div>
            <div className="text-xs text-blue-200 capitalize">{user.role}</div>
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive(link.path) ? 'bg-primary-dark text-white' : 'hover:bg-primary-light text-blue-100'
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-red-200 hover:bg-red-700 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
