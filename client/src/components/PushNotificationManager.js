import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Settings } from 'lucide-react';
import pushNotificationService from '../services/pushNotificationService';

const PushNotificationManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    subscribed: false,
    subscriptionCount: 0,
    vapidConfigured: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    // Check if push notifications are supported
    setIsSupported(pushNotificationService.isSupported);
    setPermission(pushNotificationService.constructor.getPermissionStatus());

    if (pushNotificationService.isSupported) {
      // Initialize service worker
      await pushNotificationService.initialize();
      
      // Get subscription status
      const status = await pushNotificationService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      const success = await pushNotificationService.subscribe();
      if (success) {
        setPermission('granted');
        const status = await pushNotificationService.getSubscriptionStatus();
        setSubscriptionStatus(status);
        
        // Send welcome notification
        setTimeout(() => {
          pushNotificationService.sendTestNotification('🎉 You\'re now subscribed to LifeStock notifications!');
        }, 1000);
      } else {
        alert('Failed to subscribe to notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      alert('Error subscribing to notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to unsubscribe from notifications?')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        const status = await pushNotificationService.getSubscriptionStatus();
        setSubscriptionStatus(status);
      } else {
        alert('Failed to unsubscribe from notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      alert('Error unsubscribing from notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      const success = await pushNotificationService.sendTestNotification();
      if (!success) {
        alert('Failed to send test notification. Please try again.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Error sending test notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <BellOff className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-700">
              Your browser doesn't support push notifications. Try using a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionStatus.vapidConfigured) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Notifications Not Configured
            </h3>
            <p className="text-sm text-red-700">
              Push notifications are not configured on the server. Please contact the administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notification Status */}
      <div className={`border rounded-lg p-4 ${
        subscriptionStatus.subscribed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {subscriptionStatus.subscribed ? (
              <Bell className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-600 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm font-medium ${
                subscriptionStatus.subscribed ? 'text-green-800' : 'text-gray-800'
              }`}>
                {subscriptionStatus.subscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
              </h3>
              <p className={`text-sm ${
                subscriptionStatus.subscribed ? 'text-green-700' : 'text-gray-600'
              }`}>
                {subscriptionStatus.subscribed 
                  ? `You'll receive notifications for tasks, events, and shared lists`
                  : 'Enable notifications to stay updated on tasks, events, and collaborations'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors duration-200 flex-shrink-0"
            title="Notification settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Status */}
        {permission === 'denied' && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Notifications are blocked. Please enable them in your browser settings and refresh the page.
            </p>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Notification Settings</h4>
          
          {/* Subscription Controls */}
          <div className="space-y-3">
            {!subscriptionStatus.subscribed ? (
              <button
                onClick={handleSubscribe}
                disabled={isLoading || permission === 'denied'}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Bell className="w-4 h-4" />
                <span>{isLoading ? 'Enabling...' : 'Enable Notifications'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleTestNotification}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isLoading ? 'Sending...' : 'Send Test Notification'}</span>
                </button>
                
                <button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <BellOff className="w-4 h-4" />
                  <span>{isLoading ? 'Disabling...' : 'Disable Notifications'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Subscription Info */}
          {subscriptionStatus.subscribed && (
            <div className="text-sm text-gray-600">
              <p>Active on {subscriptionStatus.subscriptionCount} device{subscriptionStatus.subscriptionCount !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Notification Types */}
          <div className="pt-3 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-2">You'll receive notifications for:</h5>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Task sharing and reminders</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Event invitations and reminders</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Shared list invitations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Collaboration updates</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Action Buttons (when settings are hidden) */}
      {!showSettings && (
        <div className="flex space-x-2">
          {!subscriptionStatus.subscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={isLoading || permission === 'denied'}
              className="flex items-center justify-center space-x-2 flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Bell className="w-4 h-4" />
              <span className="truncate">{isLoading ? 'Enabling...' : 'Enable Notifications'}</span>
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Bell className="w-4 h-4" />
              <span className="truncate">{isLoading ? 'Sending...' : 'Test Notification'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PushNotificationManager;
