import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  UserCircle,
  Users,
  X
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const navigation = [
  { name: 'Dashboard', to: '/manager', icon: LayoutDashboard, end: true },
  { name: 'Sellers', to: '/manager/sellers', icon: Users },
  { name: 'Records', to: '/manager/records', icon: FileSpreadsheet },
  { name: 'Reports', to: '/manager/reports', icon: BarChart3 },
  { name: 'Products', to: '/manager/products', icon: Package },
  { name: 'Subscription', to: '/manager/subscription', icon: CreditCard },
  { name: 'Profile', to: '/manager/profile', icon: UserCircle },
];

const getInitials = (name) => {
  if (!name) return 'M';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const Sidebar = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-white fixed h-screen top-0 left-0 border-r border-slate-800">
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800">
          <span className="text-sm font-bold tracking-wide">
            SalesFlow Manager
          </span>
          {user?.role === 'manager' && <NotificationBell />}
        </div>
        <div className="px-4 py-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-white text-sm font-black shadow-sm ring-2 ring-slate-800 overflow-hidden">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span>{getInitials(user?.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{user?.name || 'Manager'}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{user?.role || 'manager'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={16} className="mr-3 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 w-full flex items-center justify-center px-3 py-2 bg-slate-800 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={toggleMenu}
          className="fixed left-3 top-3 z-50 rounded-md bg-slate-900 p-2 text-white shadow-md hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle manager menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {mobileOpen && (
          <aside className="fixed inset-0 z-40 flex">
            {/* FIXED: Converted generic overlay backdrop mask to a semantic native HTML button */}
            <button 
              type="button"
              className="fixed inset-0 bg-black/35 cursor-default focus:outline-none" 
              aria-label="Close menu layout overlay"
              onClick={toggleMenu}
            />
            
            <div className="relative flex min-h-screen w-64 flex-col bg-slate-900 text-white shadow-xl">
              <div className="flex items-center justify-between px-4 border-b border-slate-800 h-14">
                <span className="text-sm font-bold tracking-wide text-white">SalesFlow Menu</span>
                <div className="flex items-center gap-3">
                  {user?.role === 'manager' && <NotificationBell />}
                  <button
                    type="button"
                    onClick={toggleMenu}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="px-4 py-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-black shadow-sm ring-2 ring-slate-800 overflow-hidden">
                    {user?.photo ? (
                      <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{getInitials(user?.name)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{user?.name || 'Manager'}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{user?.role || 'manager'}</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.end}
                    onClick={toggleMenu}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-md text-sm font-semibold transition-colors ${
                        isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={16} className="mr-3 shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
              <div className="p-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    toggleMenu();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center px-3 py-2 bg-slate-800 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
};

export default Sidebar;