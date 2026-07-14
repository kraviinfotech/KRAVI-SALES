import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../utils/passwordUtils';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('Weak');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError(t('reset_password.passwords_not_match'));
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        token,
        newPassword
      });
      setSuccessMessage(res.data.message || t('forgot_password.password_reset_done'));
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?role=manager');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('admin.failed_to_reset_password'));
    } finally {
      setLoading(false);
    }
  };

  if (!token && !successMessage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-300 max-w-md w-full text-center text-red-600">
          Invalid or missing reset token.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-300 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {t('reset_password.title')}
        </h2>

        {successMessage ? (
          <div className="text-center">
            <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-4 text-green-700">
              {successMessage}
            </div>
            <p className="text-sm text-slate-500 mb-4">Redirecting to login...</p>
            <button
              type="button"
              onClick={() => navigate('/login?role=manager')}
              className="text-primary hover:underline text-sm font-medium"
            >
              {t('reset_password.back_to_login')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reset-new-password" className="block text-sm font-medium text-gray-700 mb-1">{t('reset_password.new_password')}</label>
              <input
                id="reset-new-password"
                type="password"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                }}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                <span>{t('reset_password.password_strength')} <strong>{passwordStrength}</strong></span>
                <span className={`h-2.5 w-24 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}></span>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">{t('reset_password.confirm_password')}</label>
              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-2"
            >
              {loading ? t('reset_password.resetting') : t('reset_password.reset')}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/login?role=manager')}
                className="text-primary hover:underline text-sm font-medium"
              >
                {t('reset_password.back_to_login')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
