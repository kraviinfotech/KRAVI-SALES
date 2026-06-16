import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, CreditCard, 
  FileText, Settings, UserCircle, LogOut, Menu, X, Layers 
} from 'lucide-react';

const SuperAdminLayout = ({ children, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Companies', icon: <Building2 size={20} />, path: '/admin/companies' },
    { name: 'Managers', icon: <Users size={20} />, path: '/admin/managers' },
    { name: 'Subscription Plans', icon: <Layers size={20} />, path: '/admin/plans' },
    { name: 'Subscriptions', icon: <CreditCard size={20} />, path: '/admin/subscriptions' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
    { name: 'Profile', icon: <UserCircle size={20} />, path: '/admin/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6C3EF4] rounded-lg flex items-center justify-center text-white font-bold">K</div>
          {isSidebarOpen && <span className="font-bold text-xl text-gray-800">KRAVI Admin</span>}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center w-full p-3 gap-3 rounded-xl transition-colors group ${
                location.pathname === item.path ? 'bg-purple-50 text-[#6C3EF4]' : 'text-gray-600 hover:bg-purple-50 hover:text-[#6C3EF4]'
              }`}
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="flex items-center w-full p-3 gap-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">Super Admin</p>
              <p className="text-xs text-gray-500">admin@kravi.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6C3EF4]/10 flex items-center justify-center text-[#6C3EF4] font-bold border-2 border-[#6C3EF4]">
              SA
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;