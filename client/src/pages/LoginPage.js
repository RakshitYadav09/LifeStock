import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, ClipboardList, Rocket, Handshake } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import GoogleOAuth from '../components/GoogleOAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center shadow-large mx-auto mb-4">
            <span className="text-white text-3xl font-bold">T</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">
            Welcome to TaskFlow
          </h1>
          <p className="text-neutral-600">
            Sign in to collaborate and organize your tasks
          </p>
        </div>

        {/* Login Form */}
        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-neutral-800 mb-6">
                Sign In
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl animate-slide-up">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div>
              <GoogleOAuth />
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Handshake className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-xs text-neutral-600">Collaborate</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ClipboardList className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-xs text-neutral-600">Organize</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Rocket className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-xs text-neutral-600">Achieve</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
