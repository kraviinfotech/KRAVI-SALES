import React from 'react';

const GoogleLoginButton = ({ onSuccess, onFailure, disabled }) => {
  const handleClick = () => {
    if (!window.google?.accounts?.id) {
      onFailure('Google sign-in is not loaded. Please refresh the page.');
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        onFailure('Google sign-in could not be displayed.');
      }
    });
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className="w-full inline-flex items-center justify-center gap-3 rounded bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="h-5 w-5" />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
