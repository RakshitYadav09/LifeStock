import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const GoogleOAuthTraditional = () => {
  const { loginWithGoogle } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    // Create the OAuth URL
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent('openid email profile');
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('oauth_state', state);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=${responseType}&` +
      `scope=${scope}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=select_account`;
    
    // Open popup window
    const popup = window.open(
      authUrl,
      'google-signin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Listen for popup messages
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        popup.close();
        setIsLoading(false);
        loginWithGoogle(event.data.token)
          .then(() => showSuccess('Successfully signed in with Google!'))
          .catch(error => showError('Google sign-in failed: ' + error.message));
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        popup.close();
        setIsLoading(false);
        showError('Google sign-in failed: ' + event.data.error);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Clean up if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      }
    }, 1000);
  };

  // Handle OAuth callback (if redirected to this page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      showError('Google sign-in failed: ' + error);
      return;
    }
    
    if (code && state) {
      const storedState = sessionStorage.getItem('oauth_state');
      if (state === storedState) {
        // Send message to parent window (if in popup)
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_OAUTH_SUCCESS',
            token: code
          }, window.location.origin);
          window.close();
        } else {
          // Handle the code directly
          loginWithGoogle(code)
            .then(() => showSuccess('Successfully signed in with Google!'))
            .catch(error => showError('Google sign-in failed: ' + error.message));
        }
      } else {
        showError('Invalid OAuth state');
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loginWithGoogle, showSuccess, showError]);

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
      <span>{isLoading ? 'Signing in...' : 'Continue with Google (Traditional)'}</span>
    </button>
  );
};

export default GoogleOAuthTraditional;
