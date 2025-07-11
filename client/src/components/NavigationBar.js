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
  User
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useCollaboration } from '../context/UserCollaborationContext';
import QuickAddModal from './QuickAddModal';
import UserProfile from './UserProfile';

const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { pendingRequests, notifications, getUnreadNotificationsCount, handleMarkNotificationAsRead } = useCollaboration();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Handle notification click to navigate to relevant page
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read && !notification.isRead) {
        await handleMarkNotificationAsRead(notification._id || notification.id);
      }
      
      // Smart routing based on notification content and type
      const message = (notification.message || notification.title || '').toLowerCase();
      const type = notification.type || '';
      
      // Check for keywords in the message for intelligent routing
      if (message.includes('friend') || type.includes('friend')) {
        navigate('/friends');
      } else if (message.includes('event') || message.includes('calendar') || message.includes('meeting') || type.includes('event') || type.includes('calendar')) {
        navigate('/calendar');
      } else if (message.includes('task') || type.includes('task')) {
        navigate('/shared-tasks');
      } else if (message.includes('list') || type.includes('list')) {
        navigate('/shared-lists');
      } else {
        // Fallback to type-based routing
        switch (type) {
          case 'friend_request':
          case 'friend_request_accepted':
          case 'friend_request_rejected':
            navigate('/friends');
            break;
          case 'task_shared':
          case 'task_updated':
          case 'task_completed':
            navigate('/shared-tasks');
            break;
          case 'list_shared':
          case 'list_updated':
            navigate('/shared-lists');
            break;
          case 'calendar_event':
          case 'event_shared':
            navigate('/calendar');
            break;
          default:
            navigate('/');
        }
      }
      
      setShowNotifications(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
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
              <div className="block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-300">
                  LifeStock
                </h1>
                <p className="text-xs text-neutral-500 -mt-1 font-medium">Your Life, Organized</p>
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

          {/* Right side - Notifications & User Menu */}
          <div className="flex items-center space-x-3">
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden animate-slide-up z-50 max-h-[80vh] flex flex-col notification-dropdown">
                  {/* Header */}
                  <div className="p-4 bg-primary-50 border-b border-primary-100">
                    <h3 className="text-sm font-semibold text-primary-700">Notifications</h3>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-neutral-500">
                        <MailOpen className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification._id || notification.id || `notif-${notification.timestamp}`}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 hover:bg-primary-25 transition-colors cursor-pointer notification-item ${
                              !notification.read && !notification.isRead ? 'bg-primary-25' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Notification Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {notification.type === 'friend_request' ? (
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserPlus className="w-3 h-3 text-blue-600" />
                                  </div>
                                ) : notification.type?.includes('task') ? (
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-3 h-3 text-green-600" />
                                  </div>
                                ) : notification.type?.includes('list') ? (
                                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-3 h-3 text-purple-600" />
                                  </div>
                                ) : notification.type?.includes('calendar') ? (
                                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-3 h-3 text-orange-600" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Bell className="w-3 h-3 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Notification Content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-800 line-clamp-2">
                                  {notification.title || notification.message}
                                </p>
                                {notification.message && notification.title && (
                                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <p className="text-xs text-neutral-400">
                                    {new Date(notification.createdAt || notification.timestamp).toLocaleDateString()}
                                  </p>
                                  {!notification.read && !notification.isRead && (
                                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* View All Link */}
                    {notifications.length > 10 && (
                      <div className="p-3 text-center border-t border-neutral-100">
                        <button 
                          onClick={() => {
                            setShowNotifications(false);
                            // Navigate to dedicated notifications page if exists
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          View all {notifications.length} notifications
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
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
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
          <div className="md:hidden pb-4 animate-slide-up border-t border-neutral-200 mt-4 pt-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mx-2 ${
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
