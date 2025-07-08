import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, ClipboardList, Rocket, Handshake, CheckCircle2, Calendar, Shield } from 'lucide-react';
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
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-primary-50/90 via-white to-secondary-50/90">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Animated background shapes */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-20 right-40 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-success-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full relative z-10 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          {/* Left side - App Introduction */}
          <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img 
                    src="/lifestock_logo.svg" 
                    alt="LifeStock Logo" 
                    className="w-20 h-20 object-contain drop-shadow-xl"
                  />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    LifeStock
                  </h1>
                  <p className="text-neutral-500 text-sm font-medium">Your Life, Organized</p>
                </div>
              </div>
              
              <h2 className="text-2xl lg:text-4xl font-bold text-neutral-800 mb-4 leading-tight">
                Streamline Your Life, <span className="text-primary-600">Boost Productivity</span>
              </h2>
              
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                The all-in-one productivity platform that seamlessly integrates your tasks, calendar, and collaboration tools for a more organized and efficient life.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Handshake className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2 text-base">Team Collaboration</h3>
                <p className="text-sm text-neutral-600">Work together with shared tasks and real-time updates.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2 text-base">Smart Organization</h3>
                <p className="text-sm text-neutral-600">Intelligent task management with priorities and due dates.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2 text-base">Goal Achievement</h3>
                <p className="text-sm text-neutral-600">Track progress and stay motivated with insights.</p>
              </div>
            </div>

            <div className="hidden lg:block animate-slide-up mt-8" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <p className="text-base font-semibold text-primary-700 mb-3">✨ What makes LifeStock special</p>
                <ul className="grid grid-cols-2 gap-3">
                  <li className="flex items-center text-sm text-neutral-700">
                    <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    </span>
                    Real-time collaboration
                  </li>
                  <li className="flex items-center text-sm text-neutral-700">
                    <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    </span>
                    Unified calendar
                  </li>
                  <li className="flex items-center text-sm text-neutral-700">
                    <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    </span>
                    Smart notifications
                  </li>
                  <li className="flex items-center text-sm text-neutral-700">
                    <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    </span>
                    Mobile-first design
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="order-1 lg:order-2 w-full max-w-md mx-auto">
            {/* Logo and Brand for mobile */}
            <div className="text-center mb-6 lg:hidden animate-fade-in">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <img 
                  src="/lifestock_logo.svg" 
                  alt="LifeStock Logo" 
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                LifeStock
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Your productivity partner
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 animate-slide-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-neutral-600">
                    Please sign in to your account
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
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

                <div className="space-y-5 mt-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-neutral-700">
                        Email Address
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 pl-12 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white shadow-inner"
                        placeholder="your.email@example.com"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-neutral-700">
                        Password
                      </label>
                      <a href="#" className="text-xs text-primary-600 hover:text-primary-500 font-medium">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 pl-12 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white shadow-inner"
                        placeholder="••••••••••"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-600">
                      Remember me for 30 days
                    </label>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none text-base"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>

                <div className="relative my-8">
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

                <div className="text-center mt-8">
                  <p className="text-neutral-600">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
