import React, { createContext, useContext, useState } from 'react';
import { NotificationToast } from '../components/NotificationToast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 notifications max
    
    return newNotification.id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods for different notification types
  const showSuccess = (message, title = 'Success') => {
    return addNotification({ type: 'success', title, message });
  };

  const showError = (message, title = 'Error') => {
    return addNotification({ type: 'error', title, message });
  };

  const showWarning = (message, title = 'Warning') => {
    return addNotification({ type: 'warning', title, message });
  };

  const showInfo = (message, title = 'Info') => {
    return addNotification({ type: 'info', title, message });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
