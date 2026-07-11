import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://localhost:5002';
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5002';
  }

  return `${window.location.protocol}//${window.location.hostname}:5002`;
};

const attachLocalTracks = (pc, stream) => {
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));
};

export function CallProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [callState, setCallState] = useState('idle');
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callError, setCallError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (err) {
        console.warn('Error closing peer connection', err);
      }
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      screenStreamRef.current = null;
    }

    activeCallRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
    setCallState('idle');
    setCallDuration(0);
  }, []);

  const getPeerConnection = useCallback((targetUserId, callId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          callId,
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      remoteStreamRef.current = stream;
      // Ensure remote audio plays through speaker
      const audioEl = remoteAudioRef.current;
      if (audioEl) {
        audioEl.srcObject = stream;
        audioEl.muted = !isSpeakerEnabled;
        audioEl.volume = 1.0;
        const playPromise = audioEl.play?.();
        if (playPromise && playPromise.catch) playPromise.catch(() => {});
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const createOfferAndSend = useCallback(async (callId) => {
    const currentCall = activeCallRef.current;
    const stream = localStreamRef.current;

    if (!currentCall || !stream || !socketRef.current) {
      return;
    }

    const pc = getPeerConnection(currentCall.targetUserId, callId);
    attachLocalTracks(pc, stream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.emit('webrtc-offer', {
      callId,
      targetUserId: currentCall.targetUserId,
      offer,
    });

    const nextCall = { ...currentCall, callId };
    activeCallRef.current = nextCall;
    setActiveCall(nextCall);
  }, [getPeerConnection]);

  const handleReceiveOffer = useCallback(async (callId, offer, from) => {
    if (!socketRef.current) {
      return;
    }

    const pc = getPeerConnection(from, callId);
    if (localStreamRef.current) {
      attachLocalTracks(pc, localStreamRef.current);
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit('webrtc-answer', {
      callId,
      targetUserId: from,
      answer,
    });
  }, [getPeerConnection]);

  useEffect(() => {
    if (!user || !['manager', 'seller'].includes(user.role)) {
      cleanupCall();
      return undefined;
    }

    const storedToken = typeof window !== 'undefined'
      ? localStorage.getItem('auth:token:v1')
      : null;

    const finalToken = storedToken || document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1] || null;

    console.log('[CallProvider] Connecting socket with token:', {
      hasStoredToken: !!storedToken,
      hasFinalToken: !!finalToken,
      socketUrl: getSocketUrl(),
    });

    const socket = io(getSocketUrl(), {
      withCredentials: true,
      auth: {
        token: finalToken,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[CallProvider] Socket connected:', socket.id);
    });

    socket.on('incoming-call', (payload) => {
      setCallError(null);
      setIncomingCall(payload);
      setCallState('ringing');
    });

    socket.on('call-ringing', ({ callId }) => {
      setActiveCall((currentCall) => {
        const nextCall = currentCall ? { ...currentCall, callId } : currentCall;
        activeCallRef.current = nextCall;
        return nextCall;
      });
      setCallState('outgoing');
    });

    socket.on('call-accepted', async ({ callId }) => {
      setCallState('ongoing');
      setCallDuration(0); // Reset timer when call starts
      await createOfferAndSend(callId);
    });

    socket.on('call-rejected', () => {
      cleanupCall();
      setCallError('Call declined.');
    });

    socket.on('call-failed', ({ message }) => {
      cleanupCall();
      setCallError(message || 'Call could not be started.');
    });

    socket.on('call-ended', () => {
      cleanupCall();
    });

    socket.on('webrtc-offer', async ({ callId, offer, from }) => {
      await handleReceiveOffer(callId, offer, from);
    });

    socket.on('webrtc-answer', async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate', err);
        }
      }
    });

    socket.on('connect_error', (err) => {
      setCallError(err.message || 'Calling socket could not connect.');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      cleanupCall();
    };
  }, [cleanupCall, createOfferAndSend, handleReceiveOffer, user]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callState === 'ongoing') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Speaker toggle
  const toggleSpeaker = useCallback(() => {
    const audioEl = remoteAudioRef.current;
    if (audioEl) {
      audioEl.muted = !audioEl.muted;
      setIsSpeakerEnabled(!audioEl.muted);
    } else {
      setIsSpeakerEnabled(prev => !prev);
    }
  }, []);

  // Ensure remote audio element follows stream and speaker state
  useEffect(() => {
    const audioEl = remoteAudioRef.current;
    const stream = remoteStreamRef.current || remoteStream;
    if (audioEl) {
      if (stream) {
        audioEl.srcObject = stream;
      }
      audioEl.muted = !isSpeakerEnabled;
      audioEl.volume = 1.0;
      const playPromise = audioEl.play?.();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    }
  }, [remoteStream, isSpeakerEnabled]);

  const initiateCall = useCallback(async (receiverId, callType = 'voice') => {
    if (!receiverId || !socketRef.current) {
      setCallError('Calling is not ready yet.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCallError('This browser does not support calling.');
      return;
    }

    setCallError(null);

    const constraints = callType === 'voice'
      ? { audio: true, video: false }
      : { audio: true, video: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const nextCall = { targetUserId: receiverId, callType };
      activeCallRef.current = nextCall;
      setActiveCall(nextCall);
      setCallState('outgoing');

      console.log('[CallProvider] Emitting call-initiate:', { receiverId, callType });
      socketRef.current.emit('call-initiate', { receiverId, callType });
    } catch (err) {
      console.error('Media permission error:', err);
      cleanupCall();
      setCallError('Camera or microphone permission denied.');
    }
  }, [cleanupCall]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socketRef.current) {
      return;
    }

    const { callId, callerId, callType } = incomingCall;
    const constraints = callType === 'voice'
      ? { audio: true, video: false }
      : { audio: true, video: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const nextCall = { callId, targetUserId: callerId, callType };
      activeCallRef.current = nextCall;
      setActiveCall(nextCall);
      setIncomingCall(null);
      setCallState('ongoing');
      socketRef.current.emit('call-accept', { callId });
    } catch (err) {
      console.error('Media permission error:', err);
      socketRef.current.emit('call-reject', { callId });
      cleanupCall();
      setCallError('Camera or microphone permission denied.');
    }
  }, [cleanupCall, incomingCall]);

  const rejectCall = useCallback(() => {
    if (!incomingCall || !socketRef.current) {
      return;
    }

    socketRef.current.emit('call-reject', { callId: incomingCall.callId });
    setIncomingCall(null);
    setCallState('idle');
  }, [incomingCall]);

  const endCall = useCallback(() => {
    const currentCall = activeCallRef.current;

    if (currentCall && socketRef.current) {
      socketRef.current.emit('call-end', {
        callId: currentCall.callId,
        targetUserId: currentCall.targetUserId,
      });
    }

    cleanupCall();
  }, [cleanupCall]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    setIsMuted((currentValue) => !currentValue);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    setIsCameraOff((currentValue) => !currentValue);
  }, [isCameraOff]);

  const stopScreenShare = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current && peerConnectionRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        .getSenders()
        .find((item) => item.track && item.track.kind === 'video');

      if (sender && cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }
    }

    setIsScreenSharing(false);

    const currentCall = activeCallRef.current;
    if (currentCall && socketRef.current) {
      socketRef.current.emit('screen-share-toggle', {
        callId: currentCall.callId,
        targetUserId: currentCall.targetUserId,
        isSharing: false,
      });
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const currentCall = activeCallRef.current;
    if (!currentCall || !peerConnectionRef.current) return;

    if (isScreenSharing) {
      await stopScreenShare();
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        .getSenders()
        .find((item) => item.track && item.track.kind === 'video');

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);

      if (socketRef.current) {
        socketRef.current.emit('screen-share-toggle', {
          callId: currentCall.callId,
          targetUserId: currentCall.targetUserId,
          isSharing: true,
        });
      }
    } catch (err) {
      console.error('Screen share permission denied', err);
    }
  }, [isScreenSharing, stopScreenShare]);

  const value = useMemo(() => ({
    callState,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isScreenSharing,
    callError,
    callDuration,
    isSpeakerEnabled,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    toggleSpeaker,
    clearError: () => setCallError(null),
  }), [
    acceptCall,
    activeCall,
    callError,
    callState,
    callDuration,
    endCall,
    incomingCall,
    initiateCall,
    isCameraOff,
    isMuted,
    isScreenSharing,
    isSpeakerEnabled,
    localStream,
    rejectCall,
    remoteStream,
    toggleCamera,
    toggleMute,
    toggleScreenShare,
    toggleSpeaker,
  ]);

  return (
    <CallContext.Provider value={value}>
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};
