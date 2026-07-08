import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../utils/passwordUtils';

const Register = () => {

  const { t } = useTranslation();
  const initialRole = 'manager';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('Weak');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();


const sendOtpMutation = useMutation({
  mutationFn: async () => {
    const response = await API.post('/auth/send-registration-otp', {
      name,
      email,
      mobile,
      password,
      acceptedTerms,
    });
    return response.data;
  },
});

const verifyOtpMutation = useMutation({
  mutationFn: async () => {
    const response = await API.post('/auth/verify-registration-otp', {
      email,
      otp,
    });
    return response.data;
  },
});

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setError(t('register.fill_all_fields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwords_not_match'));
      return;
    }
    const emailPattern = /^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/;
    const mobilePattern = /^\d{10}$/;
    if (!emailPattern.test(email)) {
      setError(t('register.valid_email'));
      return;
    }
    if (!mobilePattern.test(mobile)) {
      setError(t('register.valid_mobile'));
      return;
    }
    if (!acceptedTerms) {
      setError(t('register.accept_terms'));
      return;
    }
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }

    setLoading(true);
    try {
      await sendOtpMutation.mutateAsync();
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('register.unable_to_send_otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError(t('register.enter_otp'));
      return;
    }

    setLoading(true);
    try {
      await verifyOtpMutation.mutateAsync();


      await login({ email, mobile, password });
navigate('/manager', { replace: true });


    } catch (err) {
      setError(err.response?.data?.message || err.message || t('register.otp_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-300 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {t('register.create_account')}
        </h2>
        <p className="text-center text-sm text-slate-500 mb-6">{t('register.description')}</p>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">{t('register.full_name')}</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">{t('register.email_address')}</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="register-mobile" className="block text-sm font-medium text-gray-700 mb-1">{t('register.mobile_number')}</label>
              <input
                id="register-mobile"
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">{t('register.password')}</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                }}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                <span>{t('register.password_strength')} <strong>{passwordStrength}</strong></span>
                <span className={`h-2.5 w-24 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}></span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">{t('register.confirm_password')}</label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-700">
              <input
                id="acceptedTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(prev => !prev)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="acceptedTerms" className="leading-5">
                {t('register.terms_agree')} <a href="/terms-privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">{t('register.terms_link')}</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || sendOtpMutation.isLoading}
              className="w-full rounded bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-2"
            >
              {loading || sendOtpMutation.isLoading ? t('register.sending_otp') : t('register.send_otp')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">{t('register.otp_sent_to')} <strong>{email}</strong>{t('register.otp_verify_msg')}</p>
            </div>

            <div>
              <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-1">{t('register.otp_code')}</label>
              <input
                id="otp-code"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || verifyOtpMutation.isLoading}
              className="w-full rounded bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-2"
            >
              {loading || verifyOtpMutation.isLoading ? t('register.verifying_otp') : t('register.verify_otp')}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setError('');
              }}
              className="w-full rounded border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t('register.back_to_edit')}
            </button>
          </form>
        )}

        <div className="text-center mt-4 text-sm">
          <Link to="/login?role=manager" className="text-primary hover:underline">
            {t('register.already_have_account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
