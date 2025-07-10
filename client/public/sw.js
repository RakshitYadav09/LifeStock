// Service Worker for Push Notifications
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('No data in push notification');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('Error parsing notification data:', error);
    notificationData = {
      title: 'LifeStock Notification',
      body: event.data.text() || 'You have a new notification',
      icon: '/icons/default-icon.png',
      badge: '/icons/badge-icon.png'
    };
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/default-icon.png',
    badge: notificationData.badge || '/icons/badge-icon.png',
    tag: notificationData.tag || 'default',
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [],
    data: notificationData.data || {},
    image: notificationData.image,
    timestamp: Date.now(),
    renotify: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Handle different actions
  let url = '/dashboard'; // default URL

  if (data && data.url) {
    url = data.url;
  }

  // Handle specific actions
  if (action === 'view') {
    url = data.url || '/dashboard';
  } else if (action === 'complete' && data.type === 'task-reminder') {
    // Could implement task completion logic here
    url = `/tasks?complete=${data.taskId}`;
  } else if (action === 'accept' && data.type === 'event-invitation') {
    url = `/calendar?accept=${data.eventId}`;
  } else if (action === 'start' && data.type === 'welcome') {
    url = '/dashboard';
  }

  // Open the app and navigate to the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action: action,
            data: data,
            url: url
          });
          return;
        }
      }

      // If the app is not open, open it
      return clients.openWindow(self.location.origin + url);
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event);
  
  // Track notification close events if needed
  const data = event.notification.data;
  if (data && data.type) {
    console.log(`Notification closed: ${data.type}`);
  }
});

// Handle background sync (for offline notifications)
self.addEventListener('sync', event => {
  console.log('Background sync:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync notifications when back online
      syncNotifications()
    );
  }
});

// Sync notifications function
async function syncNotifications() {
  try {
    // Fetch any pending notifications from the server
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastSync: localStorage.getItem('lastNotificationSync') || new Date().toISOString()
      })
    });

    if (response.ok) {
      const notifications = await response.json();
      
      // Show any missed notifications
      for (const notification of notifications) {
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icons/default-icon.png',
          badge: '/icons/badge-icon.png',
          tag: notification.tag || 'sync',
          data: notification.data || {}
        });
      }

      // Update last sync time
      localStorage.setItem('lastNotificationSync', new Date().toISOString());
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Handle message from main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
