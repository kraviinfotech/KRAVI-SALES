import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
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

/** Creates a new RTCPeerConnection, stores it in the provided ref, and
 *  closes any previously stored connection first.  The caller is responsible
 *  for eventually calling pc.close() (handled by cleanupCall / effect cleanup).
 */
function createPeerConnection(peerConnectionRef, handlers) {
  // Close any stale connection – ensures no RTCPeerConnection is ever leaked.
  if (peerConnectionRef.current) {
    try { peerConnectionRef.current.close(); } catch (_) {}
    peerConnectionRef.current = null;
  }
  const pc = new RTCPeerConnection(ICE_SERVERS);
  pc.onicecandidate = handlers.onIceCandidate;
  pc.ontrack = handlers.onTrack;
  peerConnectionRef.current = pc;
  return pc;
}

export function useCallManager(user) {
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const isSpeakerEnabledRef = useRef(true);

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
  const callStateRef = useRef(callState);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    isSpeakerEnabledRef.current = isSpeakerEnabled;
  }, [isSpeakerEnabled]);

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
        if (track.readyState === 'live') track.stop();
      });
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState === 'live') track.stop();
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

  // ─── Socket + WebRTC effect ───────────────────────────────────────────────
  // All RTCPeerConnection instances are created via createPeerConnection() which
  // always closes the previous one first, and the effect cleanup closes the
  // socket and calls cleanupCall() which closes the final connection.
  useEffect(() => {
    if (!user || !['manager', 'seller'].includes(user.role)) {
      cleanupCall();
      return () => {}; // no-op cleanup for the early-exit branch
    }

    const socket = io(getSocketUrl(), { withCredentials: true });
    socketRef.current = socket;

    // Shared peer-connection factory used by the handlers below.
    const buildPC = (targetUserId, callId) =>
      createPeerConnection(peerConnectionRef, {
        onIceCandidate: (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('ice-candidate', { callId, targetUserId, candidate: event.candidate });
          }
        },
        onTrack: (event) => {
          const stream = event.streams[0];
          setRemoteStream(stream);
          remoteStreamRef.current = stream;
          const audioEl = remoteAudioRef.current;
          if (audioEl) {
            audioEl.srcObject = stream;
            audioEl.muted = !isSpeakerEnabledRef.current;
            audioEl.volume = 1.0;
            const playPromise = audioEl.play?.();
            if (playPromise && playPromise.catch) playPromise.catch(() => {});
          }
        },
      });

    const createOfferAndSend = async (callId) => {
      const currentCall = activeCallRef.current;
      const stream = localStreamRef.current;
      if (!currentCall || !stream || !socketRef.current) return;

      const pc = buildPC(currentCall.targetUserId, callId);
      attachLocalTracks(pc, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('webrtc-offer', { callId, targetUserId: currentCall.targetUserId, offer });
      setActiveCall((currentValue) => currentValue ? { ...currentValue, callId } : currentValue);
    };

    const handleReceiveOffer = async (callId, offer, from) => {
      if (!socketRef.current) return;
      const pc = buildPC(from, callId);
      if (localStreamRef.current) attachLocalTracks(pc, localStreamRef.current);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('webrtc-answer', { callId, targetUserId: from, answer });
    };

    const onConnect = () => console.log('[CallProvider] Socket connected:', socket.id);
    const onIncomingCall = (payload) => {
      setCallError(null);
      setIncomingCall(payload);
      setCallState('ringing');
    };
    const onCallRinging = ({ callId }) => {
      if (callStateRef.current === 'ringing') return;
      setActiveCall((currentCall) => currentCall ? { ...currentCall, callId } : currentCall);
    };
    const onCallAccepted = async ({ callId }) => {
      setCallState('ongoing');
      setCallDuration(0);
      await createOfferAndSend(callId);
    };
    const onCallRejected = () => { cleanupCall(); setCallError('Call declined.'); };
    const onCallFailed = ({ message }) => { cleanupCall(); setCallError(message || 'Call could not be started.'); };
    const onCallEnded = () => cleanupCall();
    const onWebrtcOffer = async ({ callId, offer, from }) => handleReceiveOffer(callId, offer, from);
    const onWebrtcAnswer = async ({ answer }) => {
      if (peerConnectionRef.current) await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    };
    const onIceCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (err) { console.error('Error adding ICE candidate', err); }
      }
    };
    const onConnectError = (err) => setCallError(err.message || 'Calling socket could not connect.');

    socket.on('connect', onConnect);
    socket.on('incoming-call', onIncomingCall);
    socket.on('call-ringing', onCallRinging);
    socket.on('call-accepted', onCallAccepted);
    socket.on('call-rejected', onCallRejected);
    socket.on('call-failed', onCallFailed);
    socket.on('call-ended', onCallEnded);
    socket.on('webrtc-offer', onWebrtcOffer);
    socket.on('webrtc-answer', onWebrtcAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('incoming-call', onIncomingCall);
      socket.off('call-ringing', onCallRinging);
      socket.off('call-accepted', onCallAccepted);
      socket.off('call-rejected', onCallRejected);
      socket.off('call-failed', onCallFailed);
      socket.off('call-ended', onCallEnded);
      socket.off('webrtc-offer', onWebrtcOffer);
      socket.off('webrtc-answer', onWebrtcAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('connect_error', onConnectError);
      socket.close();
      socket.disconnect();
      socketRef.current = null;
      cleanupCall();
    };
  }, [cleanupCall, user]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let interval;
    if (callState === 'ongoing') {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [callState]);

  const toggleSpeaker = useCallback(() => {
    const audioEl = remoteAudioRef.current;
    if (audioEl) {
      audioEl.muted = !audioEl.muted;
      setIsSpeakerEnabled(!audioEl.muted);
    } else {
      setIsSpeakerEnabled(prev => !prev);
    }
  }, []);

  useEffect(() => {
    const audioEl = remoteAudioRef.current;
    const stream = remoteStreamRef.current || remoteStream;
    if (audioEl) {
      if (stream) audioEl.srcObject = stream;
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
    const constraints = callType === 'voice' ? { audio: true, video: false } : { audio: true, video: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      const nextCall = { targetUserId: receiverId, callType };
      setActiveCall(nextCall);
      setCallState('outgoing');
      socketRef.current.emit('call-initiate', { receiverId, callType });
    } catch (err) {
      console.error('Media permission error:', err);
      cleanupCall();
      setCallError('Camera or microphone permission denied.');
    }
  }, [cleanupCall]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socketRef.current) return;
    const { callId, callerId, callType } = incomingCall;
    const constraints = callType === 'voice' ? { audio: true, video: false } : { audio: true, video: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      const nextCall = { callId, targetUserId: callerId, callType };
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
    if (!incomingCall || !socketRef.current) return;
    socketRef.current.emit('call-reject', { callId: incomingCall.callId });
    setIncomingCall(null);
    setCallState('idle');
  }, [incomingCall]);

  const endCall = useCallback(() => {
    const currentCall = activeCallRef.current;
    if (currentCall && socketRef.current) {
      socketRef.current.emit('call-end', { callId: currentCall.callId, targetUserId: currentCall.targetUserId });
    }
    cleanupCall();
  }, [cleanupCall]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => track.enabled = isMuted);
    setIsMuted((currentValue) => !currentValue);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => track.enabled = isCameraOff);
    setIsCameraOff((currentValue) => !currentValue);
  }, [isCameraOff]);

  const stopScreenShare = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current && peerConnectionRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find((item) => item.track && item.track.kind === 'video');
      if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
    }
    setIsScreenSharing(false);
    const currentCall = activeCallRef.current;
    if (currentCall && socketRef.current) {
      socketRef.current.emit('screen-share-toggle', { callId: currentCall.callId, targetUserId: currentCall.targetUserId, isSharing: false });
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const currentCall = activeCallRef.current;
    if (!currentCall || !peerConnectionRef.current) return;
    if (isScreenSharing) return await stopScreenShare();
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find((item) => item.track && item.track.kind === 'video');
      if (sender) await sender.replaceTrack(screenTrack);
      screenTrack.onended = () => stopScreenShare();
      setIsScreenSharing(true);
      if (socketRef.current) {
        socketRef.current.emit('screen-share-toggle', { callId: currentCall.callId, targetUserId: currentCall.targetUserId, isSharing: true });
      }
    } catch (err) {
      console.error('Screen share permission denied', err);
    }
  }, [isScreenSharing, stopScreenShare]);

  return {
    remoteAudioRef,
    callState, incomingCall, activeCall, localStream, remoteStream, isMuted, isCameraOff, isScreenSharing, callError, callDuration, isSpeakerEnabled,
    initiateCall, acceptCall, rejectCall, endCall, toggleMute, toggleCamera, toggleScreenShare, toggleSpeaker, clearError: () => setCallError(null),
  };
}
