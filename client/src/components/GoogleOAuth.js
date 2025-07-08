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
            // Get container width to make button responsive
            const containerWidth = buttonElement.parentElement?.offsetWidth || 300;
            const buttonWidth = Math.min(containerWidth - 20, 380); // Max 380px, with 20px margin
            
            window.google.accounts.id.renderButton(
              buttonElement,
              {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: buttonWidth,
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

  if (!isGoogleLoaded) {
    return (
      <div className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center">
        Loading Google...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        id="google-signin-button" 
        className="w-full flex justify-center overflow-hidden"
        style={{ maxWidth: '100%' }}
      ></div>
    </div>
  );
};

export default GoogleOAuth;
