import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TERM_SECTIONS = [
  {
    id: 'acceptedCompanyAcceptance',
    title: 'Company Acceptance',
    description: 'I acknowledge the company’s policies and agree to comply with all required rules and standards.'
  },
  {
    id: 'acceptedTermsAndConditions',
    title: 'Terms & Conditions',
    description: 'I have read and agree to the Terms & Conditions governing use of KRAVI SALES.'
  },
  {
    id: 'acceptedPrivacyPolicy',
    title: 'Privacy Policy',
    description: 'I accept the Privacy Policy and consent to the collection and processing of personal data as described.'
  },
  {
    id: 'acceptedCompanyPolicies',
    title: 'Company Policies',
    description: 'I agree to follow all company policies, including security, compliance, and acceptable use guidelines.'
  }
];

const AcceptTerms = () => {
  const { user, updateSession } = useAuth();
  const [accepted, setAccepted] = useState({
    acceptedCompanyAcceptance: false,
    acceptedTermsAndConditions: false,
    acceptedPrivacyPolicy: false,
    acceptedCompanyPolicies: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (key) => {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(accepted).every(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!allChecked) {
      setError('You must agree to all required items before continuing.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/accept-terms', accepted);
      updateSession({ user: { ...user, termsAccepted: true, termsAcceptedVersion: res.data.user.termsAcceptedVersion } });
      setSuccess('Thank you. Your agreement has been recorded. Redirecting to your dashboard...');
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'manager') {
          navigate('/manager', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save acceptance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-950 px-8 py-10 text-white">
          <h1 className="text-3xl font-extrabold">Acceptance, Terms & Privacy</h1>
          <p className="mt-3 text-slate-300 max-w-2xl">Before accessing the KRAVI SALES dashboard, please review the company acceptance statement, Terms & Conditions, Privacy Policy, and Company Policies. Your acceptance will be recorded with version, date/time, and device details.</p>
        </div>

        <div className="p-8 space-y-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

          <div className="space-y-4">
            {TERM_SECTIONS.map((section) => (
              <div key={section.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={section.id}
                    checked={accepted[section.id]}
                    onChange={() => handleToggle(section.id)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <label htmlFor={section.id} className="font-semibold text-slate-900">{section.title}</label>
                    <p className="mt-2 text-sm text-slate-600">{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Important</p>
            <p className="mt-2">This agreement will only be requested again if the terms version changes. Your acceptance includes your current IP address and device information.</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!allChecked || loading}
          >
            {loading ? 'Saving agreement...' : 'Accept and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptTerms;
