import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  Clock,
} from 'lucide-react';
import { useCall } from '../context/CallProvider';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CallWindow() {
  const {
    callState,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    callDuration,
    isSpeakerEnabled,
    toggleSpeaker,
    endCall,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const windowRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef(null);

  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState !== 'ongoing' && callState !== 'outgoing') {
    return null;
  }

  const isVideoCall = activeCall?.callType !== 'voice';

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    pointerIdRef.current = event.pointerId;
    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerMove = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;

    const rect = windowRef.current?.getBoundingClientRect();
    const width = rect?.width || 320;
    const height = rect?.height || 330;

    setPosition({
      x: clamp(event.clientX - dragOffset.current.x, 12, window.innerWidth - width - 12),
      y: clamp(event.clientY - dragOffset.current.y, 12, window.innerHeight - height - 12),
    });
  };

  const handlePointerUp = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
  };

  return (
    <div
      ref={windowRef}
      className="fixed bottom-6 right-6 z-[9998] w-[320px] overflow-hidden rounded-lg bg-slate-950 shadow-2xl"
      style={position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex cursor-grab items-center justify-between bg-slate-800 px-4 py-3 text-sm font-black text-white active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center gap-3">
          <span>{callState === 'outgoing' ? 'Calling...' : 'In call'}</span>
          {callState === 'ongoing' && (
            <span className="ml-2 flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-xs font-black">
              <Clock size={12} />
              <span>{`${String(Math.floor(callDuration/60)).padStart(2,'0')}:${String(callDuration%60).padStart(2,'0')}`}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isScreenSharing && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
              Sharing
            </span>
          )}
        </div>
      </div>

      <div className="relative h-[220px] bg-black">
        {isVideoCall ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-2 right-2 h-[60px] w-20 rounded-md border-2 border-white object-cover"
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-300">
            <div className="h-16 w-16 rounded-full bg-indigo-600 shadow-[0_0_0_14px_rgba(79,70,229,0.16)]" />
            <p className="text-sm font-bold">
              {callState === 'outgoing' ? 'Waiting for answer...' : 'Voice call in progress'}
            </p>
            <p className="text-center text-xs text-slate-400">
              {activeCall?.callType === 'video' ? 'Video call ready' : 'Voice call ready'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 bg-slate-800 p-4">
        <button
          type="button"
          onClick={toggleMute}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
            isMuted ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {isVideoCall && (
          <button
            type="button"
            onClick={toggleCamera}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
              isCameraOff ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          >
            {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
        )}

        {isVideoCall && (
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
              isScreenSharing ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
            aria-label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
          >
            <MonitorUp size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={toggleSpeaker}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
            isSpeakerEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600'
          }`}
          title={isSpeakerEnabled ? 'Speaker on' : 'Speaker off'}
          aria-label={isSpeakerEnabled ? 'Speaker on' : 'Speaker off'}
        >
          <Volume2 size={18} />
        </button>

        <button
          type="button"
          onClick={endCall}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
          title="End call"
          aria-label="End call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
