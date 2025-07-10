import React, { createContext, useReducer, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import pushNotificationService from '../services/pushNotificationService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null
  });

  // Check for existing user on initial load
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: JSON.parse(userInfo)
      });
    } else {
      // Set loading to false when no user is found
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: null 
      });
    }
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      const response = await api.post('/users/login', { email, password });
      const userData = response.data;
      
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      throw new Error(message);
    }
  };

  const register = async (username, email, password) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      const response = await api.post('/users/register', { username, email, password });
      const userData = response.data;
      
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      // Auto-request push notifications for new users
      setTimeout(async () => {
        try {
          await pushNotificationService.autoSubscribeNewUser();
        } catch (error) {
          console.log('Push notification setup skipped:', error);
        }
      }, 1000); // Small delay to ensure UI is ready
      
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      throw new Error(message);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      // Decode the Google JWT token to get user info
      const googleUser = jwtDecode(googleToken);
      
      // Send the Google token to our backend for verification and user creation/login
      const response = await api.post('/users/google-login', { 
        token: googleToken,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      });
      
      const userData = response.data;
      const isNewUser = response.data.isNewUser;
      
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      // Auto-request push notifications for new users
      if (isNewUser) {
        setTimeout(async () => {
          try {
            await pushNotificationService.autoSubscribeNewUser();
          } catch (error) {
            console.log('Push notification setup skipped:', error);
          }
        }, 1000); // Small delay to ensure UI is ready
      }
      
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      loginWithGoogle,
      logout,
      clearError,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
