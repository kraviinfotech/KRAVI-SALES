import React from 'react';
import { X } from 'lucide-react';
import { useCall } from '../context/CallProvider';

export default function CallStatusToast() {
  const { callError, clearError } = useCall();

  if (!callError) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[9999] flex max-w-xs items-start gap-3 rounded-lg border border-red-200 bg-white p-3 text-sm font-semibold text-red-700 shadow-xl">
      <span className="flex-1">{callError}</span>
      <button
        type="button"
        onClick={clearError}
        className="rounded p-0.5 text-red-500 hover:bg-red-50"
        aria-label="Dismiss call message"
      >
        <X size={14} />
      </button>
    </div>
  );
}
