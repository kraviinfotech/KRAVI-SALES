import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ErrorSuccessBanners = ({ error, success }) => {
  return (
    <>
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success} Redirecting…</span>
        </div>
      )}
    </>
  );
};

export default ErrorSuccessBanners;
