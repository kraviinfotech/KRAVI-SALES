import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, UserRound, ArrowRight} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import videoSrc from '../assets/landing-page.mp4';

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
    buttonClass: 'bg-slate-900 hover:bg-slate-800'
  }
};

const Login = () => {
  const { login, logout, googleLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'manager' ? 'manager' : 'seller';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(true);

  const navigate = useNavigate();
  const currentRole = roleConfig[selectedRole];
  const Icon = currentRole.icon;

  // FIXED: Track selectedRole in a mutable Ref so the asynchronous Google Callback 
  // can instantly access the fresh value without running a state calculation chain.
  const selectedRoleRef = useRef(selectedRole);
  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  // Initialize Google SDK cleanly on mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Google Sign-In not initialized: VITE_GOOGLE_CLIENT_ID is not set');
      setGoogleReady(false);
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response.credential) {
            try {
              setLoading(true);
              const userData = await googleLogin(response.credential);
              
              // Read directly from the updated reference value safely
              const activeRole = selectedRoleRef.current;
              const isAuthorized =
                (activeRole === 'seller' && userData.role === 'seller') ||
                (activeRole === 'manager' && (userData.role === 'manager' || userData.role === 'admin'));
                
              if (!isAuthorized) {
                logout();
                setError(`Please use a ${activeRole === 'manager' ? 'manager' : 'seller'} account for this form.`);
                return;
              }
              navigate(roleRoutes[userData.role], { replace: true });
            } catch (err) {
              setError(err);
            } finally {
              setLoading(false);
            }
          }
        }
      });
      setGoogleReady(true);
    }
    // FIXED: Removed selectedRole out of dependencies to cut off the effect chains entirely.
  }, [googleLogin, logout, navigate]);

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

  const handleGoogleFailure = (message) => {
    setError(message || 'Google sign-in failed.');
  };

  return (
    <>
      {showIntroVideo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black">
          <video
            className="h-full w-full object-cover cursor-pointer"
            src={videoSrc}
            autoPlay
            muted
            playsInline
            onEnded={() => setShowIntroVideo(false)}
            onClick={() => setShowIntroVideo(false)}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/40" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm font-medium animate-pulse">
            Tap anywhere to skip
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-start justify-center px-4 pt-28 pb-8 bg-transparent sm:items-center sm:py-8 lg:justify-end lg:pl-4 lg:pr-16">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-white bg-white/95 p-6 shadow-[0_22px_60px_rgba(37,99,235,0.14)] ring-1 ring-blue-100/60">
            <div className="mb-8 text-center border-b border-blue-100/70 pb-4">
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">SalesFlow</p>
              <h1 className="mt-1 text-3xl font-black text-gray-900">Welcome Back!</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Login to continue to your account</p>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-md border border-slate-200 bg-white/90 p-1">
              <button
                type="button"
                onClick={() => handleRoleChange('seller')}
                className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-bold transition-colors ${selectedRole === 'seller'
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
                className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-bold transition-colors ${selectedRole === 'manager'
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 pr-10 text-sm shadow-inner shadow-blue-100/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-slate-500"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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

              {googleReady && selectedRole === 'manager' && (
                <div className="pt-2">
                  <GoogleLoginButton onSuccess={() => { }} onFailure={handleGoogleFailure} disabled={loading} />
                </div>
              )}
            </form>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <p className="text-center text-sm font-semibold text-slate-700">New to Kravi Salesflow?</p>
              <div className="mt-4">
                <Link
                  to="/register?role=manager"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-primary/80 hover:bg-primary/5"
                >
                  <div>
                    <p className="font-bold text-slate-950">Register as Manager</p>
                    <p className="mt-1 text-sm text-slate-500">Create your manager account and get started.</p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                    <ArrowRight size={18} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;