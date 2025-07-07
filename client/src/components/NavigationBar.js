import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Handshake, 
  Calendar, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  MailOpen,
  UserPlus,
  Plus,
  User
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useCollaboration } from '../context/UserCollaborationContext';
import QuickAddModal from './QuickAddModal';
import UserProfile from './UserProfile';

const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { pendingRequests, notifications, getUnreadNotificationsCount } = useCollaboration();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home, description: 'Overview' },
    { name: 'Friends', path: '/friends', icon: Users, badge: pendingRequests.length, description: 'Manage connections' },
    { name: 'All Tasks', path: '/shared-tasks', icon: Handshake, description: 'View all tasks' },
    { name: 'Calendar', path: '/calendar', icon: Calendar, description: 'Events & meetings' },
    { name: 'Shared Lists', path: '/shared-lists', icon: FileText, description: 'Collaborative lists' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const unreadCount = getUnreadNotificationsCount();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-primary-100 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <img 
                  src="/lifestock_logo.svg" 
                  alt="LifeStock Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                  LifeStock
                </h1>
                <p className="text-xs text-neutral-500 -mt-1">Your Life Management Hub</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative group flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 shadow-soft'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-25'
                }`}
                title={item.description}
              >
                <item.icon className="mr-2 w-4 h-4" />
                <span className="hidden lg:inline">{item.name}</span>
                {item.badge > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-secondary-400 rounded-full animate-bounce-subtle">
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - Quick Add, Notifications & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-large transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              title="Quick Add"
            >
              <Plus className="w-5 h-5" />
            </button>
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-secondary-400 rounded-full animate-bounce-subtle">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-large border border-primary-100 overflow-hidden animate-slide-up">
                  <div className="p-4 bg-primary-50 border-b border-primary-100">
                    <h3 className="text-sm font-semibold text-primary-700">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-neutral-500">
                        <MailOpen className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-neutral-100 hover:bg-primary-25 transition-colors ${
                            !notification.read ? 'bg-primary-25' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {notification.type === 'friend_request' ? 
                              <UserPlus className="w-5 h-5 text-primary-600 mt-0.5" /> : 
                              <FileText className="w-5 h-5 text-primary-600 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-800 truncate">
                                {notification.title}
                              </p>
                              {notification.message && (
                                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              )}
                              <p className="text-xs text-neutral-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {notifications.length > 5 && (
                      <div className="p-3 text-center">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-primary-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-neutral-700">
                  {user.username}
                </span>
                <svg
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-large border border-primary-100 overflow-hidden animate-slide-up">
                  <div className="p-4 bg-primary-50 border-b border-primary-100">
                    <p className="text-sm font-semibold text-primary-700">{user.username}</p>
                    <p className="text-xs text-neutral-600">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowUserProfile(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to settings page when implemented
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-secondary-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
      />

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </nav>
  );
};

export default NavigationBar;
