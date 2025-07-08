import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import GoogleOAuth from '../components/GoogleOAuth';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading, error, clearError } = useContext(AuthContext);
  const { showWarning } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      showWarning('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showWarning('Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, email, password);
      navigate('/');
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-6 animate-fade-in">
          <img src="/lifestock_logo.svg" alt="LifeStock Logo" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
            Join LifeStock
          </h1>
          <p className="text-sm text-neutral-600">
            Start organizing your life today
          </p>
        </div>
        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 sm:p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-800 mb-2">
                Create Your Account
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                Join thousands who are already organized
              </p>
              <p className="text-xs text-neutral-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-up">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-50 focus:bg-white"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-50 focus:bg-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-50 focus:bg-white"
                  placeholder="Create a strong password (min. 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-50 focus:bg-white"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="w-full">
              <GoogleOAuth />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
