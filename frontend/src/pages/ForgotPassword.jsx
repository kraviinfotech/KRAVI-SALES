import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const mobilePattern = /^\d{10}$/;

const ForgotPassword = () => {
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
      setError('Please enter a valid registered email or 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const payload = isEmail ? { email: value } : { mobile: value };
      const res = await API.post('/auth/forgot-password', payload);
      setMessage(res.data.message || 'If the email or mobile is registered, an OTP has been sent to the registered email.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while requesting OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { token: otp.trim(), newPassword });
      setMessage(res.data.message || 'Password reset successfully');
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while resetting the password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      {step === 'request' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Mobile Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. email@example.com or 9876543210"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          <div className="text-center mt-2">
            <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
              Back to Login
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="text-center mt-2">
            <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
              Back to Login
            </button>
          </div>
        </form>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <p className="text-center text-gray-700">Your password has been reset. You can now login with your new password.</p>
          <div className="text-center">
            <button type="button" onClick={() => navigate('/login')} className="text-primary underline">
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
