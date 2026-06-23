import React from 'react';
import { Link } from 'react-router-dom';

const TermsPrivacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-950">Terms & Privacy Policy</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This page contains the full Terms and Conditions, Privacy Policy, and company policy details for KRAVI SALES.
          </p>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">1. Terms and Conditions</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              By registering as a manager, you agree to use KRAVI SALES responsibly, follow all applicable laws,
              and comply with the platform’s security and operational policies. You may not share credentials,
              manipulate sales data, or engage in fraudulent activity.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Your access may be suspended or revoked for policy violations, misuse, or breach of these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">2. Privacy Policy</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              KRAVI SALES collects basic registration data such as name, email, mobile number, and account role.
              We also process activity data needed to manage seller performance, reporting, and location-based records.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Your contact information is used for account verification, notifications, and support. We do not share
              your personal information with third parties except where required by law or to provide subscribed services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">3. Company Policies</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Managers must ensure that seller accounts are used only for approved business purposes. All sales records,
              location check-ins, and inventory entries must be accurate and truthful.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Any misuse of the application, including false reporting, harassment, or unauthorized data disclosure,
              may result in disciplinary action and account termination.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">4. Acceptance</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              By checking the acceptance box on the manager registration form, you confirm that you have read, understood,
              and agreed to these Terms & Conditions, Privacy Policy, and Company Policies.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
            <span>Need to return to registration?</span>
            <Link to="/register?role=manager" className="text-primary font-semibold hover:underline">
              Go back to Manager Registration
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsPrivacy;
