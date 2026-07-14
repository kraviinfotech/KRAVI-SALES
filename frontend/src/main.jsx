import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { queryClient } from './api/queryClient'
import App from './App'
import './index.css'
import './i18n'

// --- Razorpay LocalStorage Interceptor ---
// Must run before any other code or component renders!
(function interceptRazorpayStorage() {
  if (typeof window === 'undefined' || window.__rzp_storage_patched) return;
  window.__rzp_storage_patched = true;

  try {
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    // 1. Immediately wipe out any existing rzp keys from raw localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay')) {
        originalRemoveItem.apply(localStorage, [key]);
      }
    });
    // Remove any legacy auth token left behind in localStorage.
    originalRemoveItem.apply(localStorage, ['token']);

    // 2. Patch localStorage methods
    Storage.prototype.setItem = function(key, value) {
      if (typeof key === 'string' && (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay'))) {
        return sessionStorage.setItem(key, value);
      }
      return originalSetItem.apply(this, [key, value]);
    };

    Storage.prototype.getItem = function(key) {
      if (typeof key === 'string' && (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay'))) {
        return sessionStorage.getItem(key);
      }
      return originalGetItem.apply(this, [key]);
    };

    Storage.prototype.removeItem = function(key) {
      if (typeof key === 'string' && (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay'))) {
        return sessionStorage.removeItem(key);
      }
      return originalRemoveItem.apply(this, [key]);
    };
  } catch (e) {
    console.error('Storage patch failed', e);
  }
})();
// -----------------------------------------
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

