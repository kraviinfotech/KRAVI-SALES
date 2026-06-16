import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^\d{10}$/;

const roleRoutes = {
  admin: '/admin',
  manager: '/manager',
  seller: '/dashboard'
};

const roleConfig = {
  seller: {
    title: 'Seller Login',
    subtitle: 'For the sales team',
    buttonLabel: 'Login as Seller',
    icon: UserRound,
    buttonClass: 'bg-primary hover:bg-primary-dark',
    registerLink: null
  },
  manager: {
    title: 'Manager Login',
    subtitle: 'For dashboard access',
    buttonLabel: 'Login as Manager',
    icon: ShieldCheck,
    buttonClass: 'bg-slate-900 hover:bg-slate-800',
    registerLink: { to: '/register?role=manager', label: 'Register as a Manager' },
    registerAdminLink: { to: '/register?role=admin', label: 'Register as Admin' }
  }
};

  const Login = () => {
  const { login, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'manager' ? 'manager' : 'seller';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();
  const currentRole = roleConfig[selectedRole];
  const Icon = currentRole.icon;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!identifier) {
      setError('Please enter your email or mobile number');
      return;
    }

    const isEmail = emailPattern.test(identifier);
    const isMobile = mobilePattern.test(identifier);

    if (!isEmail && !isMobile) {
      setError('Please enter a valid email address or 10-digit mobile number');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userData = await login({
        email: isEmail ? identifier : undefined,
        mobile: isMobile ? identifier : undefined,
        password
      });

      // Admins use the Manager login tab but redirect to /admin
      const isAuthorized = 
        (selectedRole === 'seller' && userData.role === 'seller') ||
        (selectedRole === 'manager' && (userData.role === 'manager' || userData.role === 'admin'));

      if (!isAuthorized) {
        logout();
        setError(`Please use a ${selectedRole === 'manager' ? 'manager' : 'seller'} account for this form.`);
        return;
      }

      navigate(roleRoutes[userData.role], { replace: true });
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen flex items-start justify-center px-4 pt-28 pb-8 bg-transparent sm:items-center sm:py-8 lg:justify-end lg:pl-4 lg:pr-16">
         <div className="w-full max-w-md">
        <div className="rounded-lg border border-white bg-white/95 p-6 shadow-[0_22px_60px_rgba(37,99,235,0.14)] ring-1 ring-blue-100/60">
          <div className="mb-8 text-center border-b border-blue-100/70 pb-4">
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">SalesFlow</p>
            <h1 className="mt-1 text-2xl font-black text-gray-900">Login</h1>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-md border border-slate-200 bg-white/90 p-1">
            <button
              type="button"
              onClick={() => handleRoleChange('seller')}
              className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-bold transition-colors ${
                selectedRole === 'seller'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-950'
              }`}
            >
              <UserRound size={16} />
              Seller
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('manager')}
              className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-bold transition-colors ${
                selectedRole === 'manager'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-950'
              }`}
            >
              <ShieldCheck size={16} />
              Manager
            </button>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-md bg-blue-50/70 p-2 text-primary">
              <Icon size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentRole.title}</h2>
              <p className="text-sm font-medium text-gray-500">{currentRole.subtitle}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email or Mobile Number</label>
              <input
                type="text"
                inputMode="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. email@example.com or 9876543210"
                className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner shadow-blue-100/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner shadow-blue-100/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="new-password"
                required
              />
              <div className="mt-1 text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-75 ${currentRole.buttonClass}`}
            >
              {loading ? 'Logging In...' : currentRole.buttonLabel}
            </button>

            {currentRole.registerLink && (
              <div className="text-right">
                <div className="flex flex-col items-end gap-2">
                  <Link to={currentRole.registerLink.to} className="text-sm font-medium text-primary hover:underline">
                    {currentRole.registerLink.label}
                  </Link>
                  {currentRole.registerAdminLink && (
                    <Link to={currentRole.registerAdminLink.to} className="text-sm font-medium text-indigo-700 hover:underline">
                      {currentRole.registerAdminLink.label}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
