import React, { useReducer, useEffect } from 'react';
import API from '../../api/axios';
import {
  UserPlus, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, ListCollapse, ShieldCheck, RefreshCw, ArrowLeft, MapPin
} from 'lucide-react';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../../utils/passwordUtils';

const STEPS = ['details', 'otp', 'done'];

// Module-level cache for instant re-navigation
let cachedSellers = null;
let hasFetchedSellers = false;


const createInitialState = () => ({
  name: '',
  mobile: '',
  email: '',
  password: '',
  passwordStrength: 'Weak',
  showPassword: false,
  step: 'details',
  otp: '',
  sellers: cachedSellers || [],
  loadingList: !hasFetchedSellers,
  visiblePasswordSellerId: null,
  locationDialog: {
    open: false,
    loading: false,
    error: '',
    location: null,
  },
  loadingSubmit: false,
  error: '',
  success: '',
});

const addSellerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'PATCH':
      return {
        ...state,
        ...action.payload,
      };

    case 'PASSWORD_CHANGED':
      return {
        ...state,
        password: action.value,
        passwordStrength: getPasswordStrength(action.value),
      };

    case 'RESET_FORM':
      return {
        ...state,
        name: '',
        mobile: '',
        email: '',
        password: '',
        passwordStrength: 'Weak',
        showPassword: false,
        step: 'details',
        otp: '',
        error: '',
        success: '',
        locationDialog: {
          open: false,
          loading: false,
          error: '',
          location: null,
        },
      };

    default:
      return state;
  }
};

const StepBadge = ({ num, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
      done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-400'
    }`}>
      {done ? <CheckCircle2 size={14} /> : num}
    </div>
    <span className={`text-xs font-bold hidden sm:block ${
      active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-gray-400'
    }`}>
      {label}
    </span>
  </div>
);

const SellerStepIndicator = ({ step }) => (
  <div className="flex items-center gap-2 mb-6">
    <StepBadge num={1} label="Details" active={step === 'details'} done={step === 'otp' || step === 'done'} />
    <div className={`flex-1 h-px ${step === 'otp' || step === 'done' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
    <StepBadge num={2} label="Verify OTP" active={step === 'otp'} done={step === 'done'} />
    <div className={`flex-1 h-px ${step === 'done' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
    <StepBadge num={3} label="Done" active={step === 'done'} done={false} />
  </div>
);

const SellerStatusBanner = ({ error, success, step }) => (
  <>
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
  </>
);

const SellerDetailsStep = ({
  name,
  mobile,
  email,
  password,
  passwordStrength,
  showPassword,
  loadingSubmit,
  onSubmit,
  onReset,
  onFieldChange,
  onPasswordChange
}) => (
  <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
      <input
        type="text"
        value={name}
        onChange={(e) => onFieldChange('name', e.target.value)}
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
        onChange={(e) => onFieldChange('mobile', e.target.value)}
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
        onChange={(e) => onFieldChange('email', e.target.value)}
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
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Min. 8 chars, uppercase, number, symbol"
          required
        />
        <button
          type="button"
          onClick={() => onFieldChange('showPassword', !showPassword)}
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
          <><Loader2 className="animate-spin" size={16} /><span>Sending OTP...</span></>
        ) : (
          <><ShieldCheck size={16} /><span>Send OTP to Email</span></>
        )}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="w-full rounded border border-gray-300 bg-white text-gray-700 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Clear Form
      </button>
    </div>
  </form>
);

const OtpStep = ({ email, otp, loadingSubmit, onSubmit, onBack, onOtpChange }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
      <p className="font-semibold mb-1">OTP sent to:</p>
      <p className="font-mono text-blue-700">{email}</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit OTP *</label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ''))}
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
          <><Loader2 className="animate-spin" size={16} /><span>Verifying...</span></>
        ) : (
          <><CheckCircle2 size={16} /><span>Verify &amp; Create Account</span></>
        )}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded border border-gray-200 text-gray-600 py-2 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1"
      >
        <ArrowLeft size={14} /> Back / Resend OTP
      </button>
    </div>
  </form>
);

const DoneStep = ({ onReset }) => (
  <div className="text-center py-6">
    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
      <CheckCircle2 className="text-emerald-600" size={36} />
    </div>
    <h3 className="text-lg font-black text-gray-900 mb-1">Account Created!</h3>
    <p className="text-sm text-gray-500 mb-6">
      The seller can now log in with their email and password.
    </p>
    <button
      onClick={onReset}
      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 text-sm transition-colors"
    >
      <RefreshCw size={14} /> Add Another Seller
    </button>
  </div>
);

const SellerFormPanel = ({
  state,
  onSendOtp,
  onVerifyOtp,
  onReset,
  onFieldChange,
  onPasswordChange,
  onBackToDetails
}) => (
  <div className="md:col-span-1 bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-fit">
    <div className="flex items-center space-x-2 mb-2">
      <UserPlus className="text-primary" size={20} />
      <h2 className="text-lg font-bold text-gray-900 font-sans">Create Seller Login</h2>
    </div>
    <p className="text-xs text-gray-500 mb-5">Generate seller credentials for new team members</p>
    <SellerStepIndicator step={state.step} />
    <SellerStatusBanner error={state.error} success={state.success} step={state.step} />

    {state.step === 'details' && (
      <SellerDetailsStep
        name={state.name}
        mobile={state.mobile}
        email={state.email}
        password={state.password}
        passwordStrength={state.passwordStrength}
        showPassword={state.showPassword}
        loadingSubmit={state.loadingSubmit}
        onSubmit={onSendOtp}
        onReset={onReset}
        onFieldChange={onFieldChange}
        onPasswordChange={onPasswordChange}
      />
    )}
    {state.step === 'otp' && (
      <OtpStep
        email={state.email}
        otp={state.otp}
        loadingSubmit={state.loadingSubmit}
        onSubmit={onVerifyOtp}
        onBack={onBackToDetails}
        onOtpChange={(value) => onFieldChange('otp', value)}
      />
    )}
    {state.step === 'done' && <DoneStep onReset={onReset} />}
  </div>
);

const SellerPasswordCell = ({ seller, visiblePasswordSellerId, onTogglePassword }) => (
  <div className="flex items-center gap-2">
    <span className="font-mono text-sm">
      {visiblePasswordSellerId === seller._id && seller.password ? seller.password : '********'}
    </span>
    {seller.password ? (
      <button
        type="button"
        onClick={() => onTogglePassword(seller._id)}
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
);

const RegisteredSellersPanel = ({
  sellers,
  loadingList,
  visiblePasswordSellerId,
  onTogglePassword,
  onShowLocation
}) => (
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
                  <SellerPasswordCell
                    seller={seller}
                    visiblePasswordSellerId={visiblePasswordSellerId}
                    onTogglePassword={onTogglePassword}
                  />
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(seller.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onShowLocation(seller._id)}
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
  </div>
);

const LocationDialog = ({ dialog, onClose }) => {
  if (!dialog.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Seller Live Location</h3>
            <p className="mt-1 text-sm text-slate-500">Latest recorded seller visit location from the manager's sales records.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            x
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {dialog.loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              Loading location details...
            </div>
          ) : dialog.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {dialog.error}
            </div>
          ) : dialog.location ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-800">Latitude</p>
                  <p className="mt-1 text-sm text-slate-700">{dialog.location.latitude}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-800">Longitude</p>
                  <p className="mt-1 text-sm text-slate-700">{dialog.location.longitude}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-800">Recorded</p>
                <p className="text-sm text-slate-700">{new Date(dialog.location.visitDatetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <a
                  href={dialog.location.mapsUrl}
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
  );
};

const AddSeller = () => {
  const [state, dispatch] = useReducer(
    addSellerReducer,
    undefined,
    createInitialState
  );

  const {
    name,
    mobile,
    email,
    password,
    otp,
    sellers,
    loadingList,
    visiblePasswordSellerId,
    locationDialog,
  } = state;

  const setField = (field, value) => {
    dispatch({
      type: 'SET_FIELD',
      field,
      value,
    });
  };

  const fetchSellers = async (quiet = false) => {
    if (!quiet) setField('loadingList', true);
    try {
      const response = await API.get('/sellers');
      setField('sellers', response.data);
      cachedSellers = response.data;
      hasFetchedSellers = true;
    } catch (err) {
      console.error(err);
    } finally {
      setField('loadingList', false);
    }
  };

  useEffect(() => {
    fetchSellers(hasFetchedSellers);
    const interval = setInterval(() => fetchSellers(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const handleShowLocation = async (sellerId) => {
    setField('locationDialog', { open: true, loading: true, error: '', location: null });
    try {
      const res = await API.get(`/sellers/${sellerId}/location`);
      setField('locationDialog', { open: true, loading: false, error: '', location: res.data });
    } catch (err) {
      setField('locationDialog', {
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
    setField('error', '');
    setField('success', '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setField('error', 'Please enter a valid email address.');
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setField('error', passwordValidation.errors.join(' '));
      return;
    }

    setField('loadingSubmit', true);
    try {
      const res = await API.post('/sellers/send-otp', { name, mobile, email, password });
      setField('success', res.data.message || 'OTP sent!');
      setField('step', 'otp');
    } catch (err) {
      if (!err.response) {
        setField('error', 'Network Error: Cannot connect to the server.');
      } else {
        setField('error', err.response.data?.message || 'Failed to send OTP.');
      }
    } finally {
      setField('loadingSubmit', false);
    }
  };

  // Step 2 – Verify OTP and create account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setField('error', '');
    if (otp.trim().length !== 6) {
      setField('error', 'Please enter the 6-digit OTP.');
      return;
    }
    setField('loadingSubmit', true);
    try {
      await API.post('/sellers/verify-otp', { email, otp: otp.trim() });
      setField('step', 'done');
      setField('success', 'Seller account created successfully!');
      fetchSellers();
    } catch (err) {
      if (!err.response) {
        setField('error', 'Network Error: Cannot connect to the server.');
      } else {
        setField('error', err.response.data?.message || 'OTP verification failed.');
      }
    } finally {
      setField('loadingSubmit', false);
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <SellerFormPanel
        state={state}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
        onReset={resetForm}
        onFieldChange={setField}
        onPasswordChange={(value) => dispatch({ type: 'PASSWORD_CHANGED', value })}
        onBackToDetails={() => {
          setField('step', 'details');
          setField('otp', '');
          setField('error', '');
          setField('success', '');
        }}
      />
      <RegisteredSellersPanel
        sellers={sellers}
        loadingList={loadingList}
        visiblePasswordSellerId={visiblePasswordSellerId}
        onTogglePassword={(sellerId) => setField(
          'visiblePasswordSellerId',
          visiblePasswordSellerId === sellerId ? null : sellerId
        )}
        onShowLocation={handleShowLocation}
      />
      <LocationDialog
        dialog={locationDialog}
        onClose={() => setField('locationDialog', { open: false, loading: false, error: '', location: null })}
      />
    </div>
  );
};

export default AddSeller;
