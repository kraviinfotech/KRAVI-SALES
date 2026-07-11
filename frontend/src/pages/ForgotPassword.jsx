import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';

const emailPattern = /^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/;
const mobilePattern = /^\d{10}$/;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const value = identifier.trim();
    const isEmail = emailPattern.test(value);
    const isMobile = mobilePattern.test(value);

    if (!isEmail && !isMobile) {
      setError(t('forgot_password.invalid_identifier'));
      return;
    }

    setLoading(true);
    try {
      const payload = isEmail ? { email: value } : { mobile: value };
      const res = await API.post('/auth/forgot-password', payload);
      setMessage(res.data.message || t('forgot_password.invalid_identifier'));
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || t('forgot_password.invalid_identifier'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim()) {
      setError(t('forgot_password.otp_required'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('forgot_password.passwords_not_match'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('forgot_password.min_password'));
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { token: otp.trim(), newPassword });
      setMessage(res.data.message || t('forgot_password.resetting'));
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || t('forgot_password.invalid_identifier'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4 text-center">{t('forgot_password.title')}</h2>
      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      {step === 'request' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="forgot-password-identifier" className="block text-sm font-medium text-gray-700 mb-1">{t('forgot_password.email_or_mobile')}</label>
            <input
              id="forgot-password-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('forgot_password.placeholder')}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? t('forgot_password.sending_otp') : t('forgot_password.send_otp')}
          </button>
          <div className="text-center mt-2">
            <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
              {t('forgot_password.back_to_login')}
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="forgot-password-otp" className="block text-sm font-medium text-gray-700 mb-1">{t('forgot_password.otp_code')}</label>
            <input
              id="forgot-password-otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t('forgot_password.otp_code')}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="forgot-password-new" className="block text-sm font-medium text-gray-700 mb-1">{t('forgot_password.new_password')}</label>
            <input
              id="forgot-password-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="forgot-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">{t('forgot_password.confirm_new_password')}</label>
            <input
              id="forgot-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? t('forgot_password.resetting') : t('forgot_password.reset_password')}
          </button>
          <div className="text-center mt-2">
            <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
              {t('forgot_password.back_to_login')}
            </button>
          </div>
        </form>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <p className="text-center text-gray-700">{t('forgot_password.password_reset_done')}</p>
          <div className="text-center">
            <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
              {t('forgot_password.back_to_login')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
