// Push Notification Utility for Frontend
class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.registration = null;
    this.subscription = null;
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  }


  getAuthToken() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      return token;
    }
    return null;
  }

  // Initialize service worker and push notifications
  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Handle messages from service worker
  handleServiceWorkerMessage(event) {
    const { type, action, data, url } = event.data;

    if (type === 'NOTIFICATION_CLICK') {
      // Handle notification click actions
      console.log('Notification clicked:', { action, data, url });

      // Navigate to the appropriate page
      if (url && window.location.pathname !== url) {
        window.location.href = url;
      }

      // Handle specific actions
      if (action === 'complete' && data.type === 'task-reminder') {
        this.handleTaskComplete(data.taskId);
      } else if (action === 'accept' && data.type === 'event-invitation') {
        this.handleEventAccept(data.eventId);
      }
    }
  }

  // Handle task completion from notification
  async handleTaskComplete(taskId) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completed: true })
      });

      if (response.ok) {
        console.log('Task marked as complete from notification');
        // Refresh the page or update the task list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error completing task from notification:', error);
    }
  }

  // Handle event acceptance from notification
  async handleEventAccept(eventId) {
    try {
      // Implementation depends on your event acceptance logic
      console.log('Event accepted from notification:', eventId);
      // Navigate to calendar or show success message
      window.location.href = '/calendar';
    } catch (error) {
      console.error('Error accepting event from notification:', error);
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      return 'not-supported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Get VAPID public key from server
  async getVapidPublicKey() {
    try {
      const response = await fetch(`${this.baseURL}/push/vapid-public-key`);
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    if (!this.isSupported || !this.registration) {
      console.error('Push notifications not supported or service worker not registered');
      return false;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission not granted');
      return false;
    }

    try {
      const vapidPublicKey = await this.getVapidPublicKey();
      if (!vapidPublicKey || vapidPublicKey === 'not-configured') {
        console.error('VAPID public key not configured on server');
        return false;
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Send subscription to server
      const response = await fetch(`${this.baseURL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          subscription: this.subscription
        })
      });

      if (response.ok) {
        console.log('Successfully subscribed to push notifications');
        return true;
      } else {
        console.error('Failed to send subscription to server');
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.subscription) {
      console.log('No active subscription to unsubscribe from');
      return true;
    }

    try {
      // Unsubscribe from push manager
      await this.subscription.unsubscribe();

      // Remove subscription from server
      await fetch(`${this.baseURL}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          endpoint: this.subscription.endpoint
        })
      });

      this.subscription = null;
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Check subscription status
  async getSubscriptionStatus() {
    try {
      const response = await fetch(`${this.baseURL}/push/status`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { subscribed: false, subscriptionCount: 0, vapidConfigured: false };
      }
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { subscribed: false, subscriptionCount: 0, vapidConfigured: false };
    }
  }

  // Send test notification
  async sendTestNotification(message = 'Test notification from LifeStock!') {
    try {
      const response = await fetch(`${this.baseURL}/push/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        console.log('Test notification sent successfully');
        return true;
      } else {
        console.error('Failed to send test notification');
        return false;
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if notifications are supported
  static isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Get current permission status
  static getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  }
}

// Create and export singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
