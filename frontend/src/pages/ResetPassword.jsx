import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../utils/passwordUtils';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('Weak');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data.message || 'Password reset successful');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password-new" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            id="reset-password-new"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordStrength(getPasswordStrength(e.target.value));
            }}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Password strength: <strong>{passwordStrength}</strong></span>
            <span className={`h-2.5 w-24 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}></span>
          </div>
        </div>
        <div>
          <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            id="reset-password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
<div className="flex flex-col items-center mt-2">
  <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
    Back to Login
  </button>

</div>
      </form>
    </div>
  );
};

export default ResetPassword;
