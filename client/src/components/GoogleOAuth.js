import React, { useContext, useEffect, useState, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const GoogleOAuth = () => {
  const { loginWithGoogle } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      await loginWithGoogle(response.credential);
      showSuccess('Successfully signed in with Google!');
    } catch (error) {
      showError('Google sign-in failed: ' + error.message);
    }
  }, [loginWithGoogle, showSuccess, showError]);

  const initializeGoogleSignIn = useCallback(() => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        // Render the Google button
        setTimeout(() => {
          const buttonElement = document.getElementById('google-signin-button');
          if (buttonElement) {
            window.google.accounts.id.renderButton(
              buttonElement,
              {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: 400,
              }
            );
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        showError('Failed to initialize Google Sign-In');
      }
    }
  }, [handleGoogleResponse, showError]);

  useEffect(() => {
    // Load Google Identity Services
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        showError('Failed to load Google services. Please refresh the page.');
      };
      document.head.appendChild(script);
    } else {
      setIsGoogleLoaded(true);
      initializeGoogleSignIn();
    }
  }, [initializeGoogleSignIn, showError]);

  const handleManualSignIn = () => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        showError('Failed to show Google sign-in prompt');
      }
    } else {
      showError('Google services not loaded yet. Please try again.');
    }
  };

  if (!isGoogleLoaded) {
    return (
      <div className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center">
        Loading Google...
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div id="google-signin-button" className="w-full flex justify-center"></div>
      {/* Fallback button */}
      <button
        onClick={handleManualSignIn}
        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors text-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Try Google Sign-In</span>
      </button>
    </div>
  );
};

export default GoogleOAuth;
