import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  UserPlus, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, ListCollapse, ShieldCheck, RefreshCw, ArrowLeft, MapPin
} from 'lucide-react';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../../utils/passwordUtils';

const STEPS = ['details', 'otp', 'done'];

const AddSeller = () => {
  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('Weak');
  const [showPassword, setShowPassword] = useState(false);

  // OTP step
  const [step, setStep] = useState('details'); // 'details' | 'otp' | 'done'
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(''); // auto-fill in dev

  // Sellers list
  const [sellers, setSellers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [visiblePasswordSellerId, setVisiblePasswordSellerId] = useState(null);
  const [locationDialog, setLocationDialog] = useState({ open: false, loading: false, error: '', location: null });

  // UI states
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSellers = async () => {
    try {
      const response = await API.get('/sellers');
      setSellers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSellers();
    const interval = setInterval(fetchSellers, 20000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setPassword('');
    setOtp('');
    setDevOtp('');
    setStep('details');
    setError('');
    setSuccess('');
    setLocationDialog({ open: false, loading: false, error: '', location: null });
  };

  const handleShowLocation = async (sellerId) => {
    setLocationDialog({ open: true, loading: true, error: '', location: null });
    try {
      const res = await API.get(`/sellers/${sellerId}/location`);
      setLocationDialog({ open: true, loading: false, error: '', location: res.data });
    } catch (err) {
      setLocationDialog({
        open: true,
        loading: false,
        error: err.response?.data?.message || 'Unable to load location data',
        location: null
      });
    }
  };

  // Step 1 – Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors.join(' '));
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await API.post('/sellers/send-otp', { name, mobile, email, password });
      setSuccess(res.data.message || 'OTP sent!');
      // In dev mode the server returns devOtp – auto-fill it for convenience
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp);
      }
      setStep('otp');
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Cannot connect to the server.');
      } else {
        setError(err.response.data?.message || 'Failed to send OTP.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Step 2 – Verify OTP and create account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setLoadingSubmit(true);
    try {
      await API.post('/sellers/verify-otp', { email, otp: otp.trim() });
      setStep('done');
      setSuccess('Seller account created successfully!');
      fetchSellers();
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Cannot connect to the server.');
      } else {
        setError(err.response.data?.message || 'OTP verification failed.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Step indicator badge
  const StepBadge = ({ num, label, active, done }) => (
    <div className={`flex items-center gap-2`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        {done ? <CheckCircle2 size={14} /> : num}
      </div>
      <span className={`text-xs font-bold hidden sm:block ${active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Add Seller Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-fit">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            <UserPlus className="text-primary" size={20} />
            <h2 className="text-lg font-bold text-gray-900 font-sans">Create Seller Login</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">Generate seller credentials for new team members</p>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <StepBadge num={1} label="Details" active={step === 'details'} done={step === 'otp' || step === 'done'} />
            <div className={`flex-1 h-px ${step === 'otp' || step === 'done' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            <StepBadge num={2} label="Verify OTP" active={step === 'otp'} done={step === 'done'} />
            <div className={`flex-1 h-px ${step === 'done' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            <StepBadge num={3} label="Done" active={step === 'done'} done={false} />
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-center space-x-2 text-sm font-medium border border-red-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && step !== 'otp' && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 flex items-center space-x-2 text-sm font-medium border border-green-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ── STEP 1: Details Form ── */}
          {step === 'details' && (
            <form onSubmit={handleSendOtp} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="seller@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordStrength(getPasswordStrength(e.target.value));
                    }}
                    autoComplete="new-password"
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Min. 8 chars, uppercase, number, symbol"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Password strength: <strong>{passwordStrength}</strong></span>
                  <span className={`h-2.5 w-24 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}></span>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 shadow-sm"
                >
                  {loadingSubmit ? (
                    <><Loader2 className="animate-spin" size={16} /><span>Sending OTP…</span></>
                  ) : (
                    <><ShieldCheck size={16} /><span>Send OTP to Email</span></>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded border border-gray-300 bg-white text-gray-700 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Clear Form
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">OTP sent to:</p>
                <p className="font-mono text-blue-700">{email}</p>
                {devOtp && (
                  <div className="mt-3 bg-amber-50 border border-amber-300 rounded p-2">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">
                      Dev Mode — OTP auto-filled
                    </p>
                    <p className="font-mono text-2xl font-black text-amber-800 tracking-widest">{devOtp}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit OTP *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-center text-2xl font-black tracking-[0.4em] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="_ _ _ _ _ _"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">OTP expires in 10 minutes</p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loadingSubmit || otp.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 text-sm disabled:opacity-60 shadow-sm transition-colors"
                >
                  {loadingSubmit ? (
                    <><Loader2 className="animate-spin" size={16} /><span>Verifying…</span></>
                  ) : (
                    <><CheckCircle2 size={16} /><span>Verify &amp; Create Account</span></>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('details'); setOtp(''); setDevOtp(''); setError(''); setSuccess(''); }}
                  className="w-full rounded border border-gray-200 text-gray-600 py-2 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} /> Back / Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-600" size={36} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">Account Created!</h3>
              <p className="text-sm text-gray-500 mb-6">
                The seller can now log in with their email and password.
              </p>
              <button
                onClick={resetForm}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <RefreshCw size={14} /> Add Another Seller
              </button>
            </div>
          )}
        </div>

        {/* Right: Existing Sellers List */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <ListCollapse className="text-gray-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900 font-sans">Registered Team Members</h2>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No sales team members have been registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="p-3">Seller Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Password</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3">Live Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {sellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="p-3 font-medium text-gray-900">{seller.name}</td>
                      <td className="p-3 font-mono">{seller.mobile}</td>
                      <td className="p-3 font-mono text-xs">{seller.email || '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {visiblePasswordSellerId === seller._id && seller.password ? seller.password : '••••••••'}
                          </span>
                          {seller.password ? (
                            <button
                              type="button"
                              onClick={() => setVisiblePasswordSellerId(prev => prev === seller._id ? null : seller._id)}
                              className="text-gray-500 hover:text-gray-800"
                            >
                              {visiblePasswordSellerId === seller._id ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">
                              No password
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(seller.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleShowLocation(seller._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                        >
                          <MapPin size={14} /> View Location
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {locationDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
              <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Seller Live Location</h3>
                    <p className="mt-1 text-sm text-slate-500">Latest recorded seller visit location from the manager’s sales records.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationDialog({ open: false, loading: false, error: '', location: null })}
                    className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {locationDialog.loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                      Loading location details…
                    </div>
                  ) : locationDialog.error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                      {locationDialog.error}
                    </div>
                  ) : locationDialog.location ? (
                    <div className="space-y-4">

                      {/* Shop Details 
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-semibold text-slate-800">Shop</p>
                        <p className="mt-1 text-sm text-slate-700">{locationDialog.location.shopName || 'Unknown shop'}</p>
                        <p className="mt-1 text-sm text-slate-500">{locationDialog.location.shopAddress || 'Address not available'}</p>
                      </div>
                      */}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-800">Latitude</p>
                          <p className="mt-1 text-sm text-slate-700">{locationDialog.location.latitude}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-800">Longitude</p>
                          <p className="mt-1 text-sm text-slate-700">{locationDialog.location.longitude}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-semibold text-slate-800">Recorded</p>
                        <p className="text-sm text-slate-700">{new Date(locationDialog.location.visitDatetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        <a
                          href={locationDialog.location.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                      No location details to display.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddSeller;
