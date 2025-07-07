import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-400 text-green-800';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800';
      case 'info':
      default:
        return 'bg-primary-50 border-l-4 border-primary-400 text-primary-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };

  return (
    <div className={`max-w-sm w-full shadow-large rounded-2xl overflow-hidden animate-slide-up ${getNotificationStyle(notification.type)}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {(() => {
              const IconComponent = getNotificationIcon(notification.type);
              return <IconComponent className="w-5 h-5" />;
            })()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold">{notification.title}</p>
            {notification.message && (
              <p className="text-sm mt-1 opacity-90">{notification.message}</p>
            )}
            <p className="text-xs mt-2 opacity-70">
              {new Date(notification.createdAt || Date.now()).toLocaleTimeString()}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex rounded-lg p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current transition-all duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-4 max-w-sm w-full">
      {notifications.slice(0, 5).map((notification) => (
        <NotificationToast
          key={notification._id || notification.id}
          notification={notification}
          onClose={() => removeNotification(notification._id || notification.id)}
        />
      ))}
    </div>
  );
};

export { NotificationToast, NotificationContainer };
