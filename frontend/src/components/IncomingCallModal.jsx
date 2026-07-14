import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useCall } from '../context/CallProvider';

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall, callState } = useCall();
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (callState === 'ringing' && ringtoneRef.current) {
      ringtoneRef.current.play().catch(() => {
        // Browsers can block autoplay until the first user gesture.
      });
    }

    const ringtone = ringtoneRef.current;
    return () => {
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }
    };
  }, [callState]);

  if (callState !== 'ringing' || !incomingCall) {
    return null;
  }

  const { callerName, callerRole, callType } = incomingCall;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4">
      <audio ref={ringtoneRef} loop src="/sounds/ringtone.mp3">
        <track kind="captions" />
      </audio>
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-black text-white">
          {callerName ? callerName.charAt(0).toUpperCase() : '?'}
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">{callerName || 'Unknown caller'}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {callerRole === 'manager' ? 'Manager' : 'Seller'} incoming {callType === 'video' ? 'video' : 'voice'} call
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">Answer or decline from this secure call prompt.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={rejectCall}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 text-sm font-black text-white hover:bg-red-700"
          >
            <PhoneOff size={17} />
            Decline
          </button>
          <button
            type="button"
            onClick={acceptCall}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 text-sm font-black text-white hover:bg-emerald-700"
          >
            <Phone size={17} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
