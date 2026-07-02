import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Users, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleConfig = {
  admin: { badge: 'Master Control', title: 'Admin Access', subtitle: 'Manage System & Companies', color: 'bg-[#6C3EF4]', text: 'text-[#6C3EF4]', light: 'bg-purple-50', borderColor: 'border-purple-200' },
  manager: { badge: 'Operations', title: 'Manager Login', subtitle: 'Oversee Sellers & Reports', color: 'bg-[#0EA5E9]', text: 'text-[#0EA5E9]', light: 'bg-blue-50', borderColor: 'border-blue-200' },
  seller: { badge: 'Field Access', title: 'Seller Login', subtitle: 'Record Visits & Sales', color: 'bg-[#6366F1]', text: 'text-[#6366F1]', light: 'bg-indigo-50', borderColor: 'border-indigo-200' }
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState('admin');

  const currentRole = roleConfig[activeRole];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Call login with credentials
      const userData = await login({ email, password });
      
      // Check if user is admin
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Only admins can access this portal');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Stylish background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-purple-200 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full blur-[100px] opacity-50"></div>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-purple-100/50 border border-gray-100 overflow-hidden z-10">
        
        {/* App Branding */}
        <div className="p-8 pb-2 text-center">
          <div className="w-12 h-12 bg-[#6C3EF4] rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-purple-200 rotate-3">
            K
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">KRAVI ADMIN</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 tracking-tighter">Enterprise Access Portal</p>
        </div>

        {/* Improved Role Selector Tabs */}
        <div className="px-8 py-2">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
            {['admin', 'manager', 'seller'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeRole === role 
                    ? 'bg-white text-gray-900 shadow-sm scale-[1.02]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Role Card Section */}
        <div className={`mt-6 mx-8 p-6 rounded-3xl transition-all duration-500 border-2 border-dashed ${currentRole.borderColor} ${currentRole.light}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white shadow-sm ${currentRole.text}`}>
              {activeRole === 'admin' && <ShieldCheck size={28} />}
              {activeRole === 'manager' && <Users size={28} />}
              {activeRole === 'seller' && <ShoppingBag size={28} />}
            </div>
            <div className="text-left">
              <h2 className="font-black text-gray-900 leading-none uppercase tracking-tighter">{currentRole.title}</h2>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight italic">{currentRole.badge}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#6C3EF4] focus:ring-4 focus:ring-purple-50 outline-none transition-all font-medium text-sm"
                placeholder={activeRole === 'admin' ? "admin@kravi.com" : "user@company.com"}
              />
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#6C3EF4] focus:ring-4 focus:ring-purple-50 outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 ${currentRole.color} shadow-purple-100`}
          >
            {isLoading ? 'VERIFYING...' : (
              <>
                SIGN IN
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="p-8 pt-0 text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-loose">
            Secure Identity Management <br /> 
            Protected by KRAVI Tech
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;