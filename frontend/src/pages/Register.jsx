import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../utils/passwordUtils';

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
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

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const mobilePattern = /^\d{10}$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!mobilePattern.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms & Privacy Policy to register.');
      return;
    }
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, mobile, password, role: 'manager', acceptedTerms });
      alert('Registration successful! Please login to continue.');
      navigate('/login?role=manager', { replace: true });
    } catch (err) {
      setError(typeof err === 'string' ? err : (err?.message || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-300 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Create Manager Account
        </h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
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
              <span>Password strength: <strong>{passwordStrength}</strong></span>
              <span className={`h-2.5 w-24 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}></span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
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
              I agree to the <a href="/terms-privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">Terms &amp; Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-75 mt-2"
          >
            {loading ? 'Creating account...' : 'Register as Manager'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <Link to="/login?role=manager" className="text-primary hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
