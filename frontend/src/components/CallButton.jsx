import React from 'react';
import { Loader2, Phone, Video } from 'lucide-react';
import { useCall } from '../context/CallProvider';

export default function CallButton({ targetUserId, type = 'voice', label }) {
  const { callState, initiateCall } = useCall();
  const isBusy = callState !== 'idle';
  const Icon = type === 'video' ? Video : Phone;

  return (
    <button
      type="button"
      disabled={!targetUserId || isBusy}
      onClick={(event) => {
        event.stopPropagation();
        initiateCall(targetUserId, type);
      }}
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-black text-white transition-colors ${
        isBusy || !targetUserId
          ? 'cursor-not-allowed bg-slate-300'
          : type === 'video'
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
      }`}
      title={type === 'video' ? 'Start video call' : 'Start voice call'}
      aria-label={type === 'video' ? 'Start video call' : 'Start voice call'}
    >
      {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      <span>{label || (type === 'video' ? 'Video' : 'Call')}</span>
    </button>
  );
}
