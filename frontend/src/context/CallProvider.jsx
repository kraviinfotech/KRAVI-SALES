import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useCallManager } from '../hooks/useCallManager';

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const { user } = useAuth();
  
  const callManager = useCallManager(user);

  const value = useMemo(() => callManager, [callManager]);

  return (
    <CallContext.Provider value={value}>
      <audio ref={callManager.remoteAudioRef} autoPlay style={{ display: 'none' }}>
        <track kind="captions" />
      </audio>
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
