import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, ClipboardList, Home, LogOut, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const bottomLinks = [
  { label: 'Home', to: '/dashboard', icon: Home },
  { label: 'Records', to: '/my-records', icon: ClipboardList },
  { label: 'Reports', to: '/seller/reports', icon: BarChart3 }
];

const routeTitles = [
  { match: '/sell/shop', title: 'Shop Details' },
  { match: '/sell/products', title: 'Add Product' },
  { match: '/sell/review', title: 'Review' },
  { match: '/my-records', title: 'My Records' },
  { match: '/seller/reports', title: 'Reports' },
  { match: '/seller/profile', title: 'Profile' },
  { match: '/dashboard', title: 'Dashboard' }
];

const SellerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const title = routeTitles.find((route) => location.pathname.startsWith(route.match))?.title || 'SalesFlow';
  const canGoBack = location.pathname !== '/dashboard';
  const showBottomNav = !location.pathname.startsWith('/sell');

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      setCheckingSubscription(true);
      try {
        const res = await API.get('/subscriptions/my-status');
        if (active) setSubscriptionStatus(res.data);
      } catch (err) {
        if (active) {
          setSubscriptionStatus({
            canUseApp: false,
            message: err.response?.data?.message || 'Your manager subscription is not active.'
          });
        }
      } finally {
        if (active) setCheckingSubscription(false);
      }
    };

    loadStatus();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="w-full bg-white shadow-sm sticky top-0 z-20">
        <div className="flex h-14 items-center px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            {canGoBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-white text-[10px] font-black shadow-sm ring-2 ring-white overflow-hidden">
                {user?.photo ? (
                  <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{getInitials(user?.name)}</span>
                )}
              </div>
            )}
            {!canGoBack && (
              <div className="hidden sm:block">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Welcome</p>
                <p className="text-[11px] font-black text-slate-900 leading-tight truncate max-w-[80px]">{user?.name}</p>
              </div>
            )}
          </div>

          <h1 className="flex-1 text-center text-lg font-bold text-slate-900">{title}</h1>
          
          <div className="flex items-center gap-1 border-l pl-3 ml-3 border-slate-200">
            {['en', 'hi', 'mr'].map((l) => (
              <button
                key={l}
                onClick={() => toggleLang(l)}
                className={`text-[10px] font-black w-6 h-6 rounded flex items-center justify-center uppercase ${lang === l ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-3 flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-24">
        {checkingSubscription ? (
          <div className="flex min-h-[60vh] items-center justify-center text-sm font-bold text-slate-500">
            Checking subscription...
          </div>
        ) : subscriptionStatus && !subscriptionStatus.canUseApp ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-600">
                <LockKeyhole size={24} />
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950">Access paused</h2>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {subscriptionStatus.message || 'Your manager subscription has expired. Please ask your manager to renew the plan.'}
              </p>
            </div>
          </div>
        ) : (
          <Outlet context={{ lang }} />
        )}
      </div>

      {showBottomNav && subscriptionStatus?.canUseApp && (
        <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-30">
          <div className="flex h-16 max-w-5xl mx-auto justify-around items-center">
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-colors ${
                      isActive ? 'text-blue-700' : 'text-slate-500 hover:text-blue-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default SellerLayout;
