import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Phone, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SellerProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-white text-xl font-black shadow-inner overflow-hidden border-2 border-white">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">{user?.name || 'Seller'}</h2>
            <p className="text-xs font-bold capitalize text-slate-500">{user?.role || 'seller'}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
          <Phone size={16} className="text-blue-700" />
          <span>{user?.mobile || 'Mobile not available'}</span>
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-red-600 text-sm font-black text-white shadow-sm transition-colors hover:bg-red-700"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default SellerProfile;
