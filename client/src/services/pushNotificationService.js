// Push Notification Utility for Frontend
class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.registration = null;
    this.subscription = null;
    
    // Determine API base URL based on environment
    if (process.env.NODE_ENV === 'production') {
      this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://lifestock.onrender.com/api';
    } else {
      this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    }
  }

  // Get authentication token from localStorage
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

  // Request permission and subscribe automatically for new users
  async autoSubscribeNewUser() {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Initialize service worker first
      await this.initialize();
      
      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        return await this.subscribe();
      }

      // Request permission with user-friendly prompt
      const permission = await this.requestPermission();
      
      if (permission === 'granted') {
        return await this.subscribe();
      }
      
      return false;
    } catch (error) {
      console.error('Error auto-subscribing new user:', error);
      return false;
    }
  }

  // Enhanced permission request with better UX
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

    // Show a custom prompt before requesting permission
    const shouldRequest = await this.showPermissionPrompt();
    
    if (!shouldRequest) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Show custom permission prompt
  async showPermissionPrompt() {
    return new Promise((resolve) => {
      // Create a custom modal for permission request
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5H7.5A7.5 7.5 0 0115 12v5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Enable Notifications</h3>
          </div>
          <p class="text-gray-600 mb-6">
            Stay updated with task reminders, event notifications, and collaboration updates. 
            This works great on mobile devices too!
          </p>
          <div class="flex space-x-3">
            <button id="allow-notifications" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Allow Notifications
            </button>
            <button id="deny-notifications" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Maybe Later
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Add event listeners
      modal.querySelector('#allow-notifications').onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };

      modal.querySelector('#deny-notifications').onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };

      // Close on background click
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(false);
        }
      };
    });
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
