const webPush = require('web-push');
require('dotenv').config();

// Configure web push with VAPID keys (only if they exist)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && 
    process.env.VAPID_PUBLIC_KEY !== 'your_vapid_public_key_here' &&
    process.env.VAPID_PRIVATE_KEY !== 'your_vapid_private_key_here') {
  
  // Use proper contact email based on environment
  const contactEmail = process.env.CONTACT_EMAIL || 'support@lifestock.app';
  
  webPush.setVapidDetails(
    'mailto:' + contactEmail,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.log('⚠️  VAPID keys not configured. Push notifications will not work.');
  console.log('   Visit /api/push/generate-vapid-keys to generate keys.');
}

// Generate VAPID keys (run once to get keys)
const generateVapidKeys = () => {
  const vapidKeys = webPush.generateVAPIDKeys();
  console.log('VAPID Keys Generated:');
  console.log('Public Key:', vapidKeys.publicKey);
  console.log('Private Key:', vapidKeys.privateKey);
  console.log('\nAdd these to your .env file:');
  console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
  return vapidKeys;
};

// Send push notification
const sendPushNotification = async (subscription, payload) => {
  try {
    // Check if VAPID keys are configured
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY ||
        process.env.VAPID_PUBLIC_KEY === 'your_vapid_public_key_here' ||
        process.env.VAPID_PRIVATE_KEY === 'your_vapid_private_key_here') {
      console.warn('⚠️  VAPID keys not configured. Cannot send push notification.');
      return { success: false, error: 'VAPID keys not configured' };
    }

    const result = await webPush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push notification sent successfully');
    return { success: true, result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

// Notification templates
const notificationTemplates = {
  taskShared: (taskData, sharedByUser) => ({
    title: '🤝 Task Shared - LifeStock',
    body: `${sharedByUser} shared "${taskData.title}" with you`,
    icon: '/icons/task-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'task-shared',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Task',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    data: {
      type: 'task-shared',
      taskId: taskData._id,
      url: '/tasks'
    }
  }),

  taskReminder: (taskData) => ({
    title: '⏰ Task Reminder - LifeStock',
    body: `Don't forget: "${taskData.title}" is due ${taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'soon'}`,
    icon: '/icons/reminder-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'task-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Task',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'complete',
        title: 'Mark Complete',
        icon: '/icons/complete-icon.png'
      }
    ],
    data: {
      type: 'task-reminder',
      taskId: taskData._id,
      url: '/tasks'
    }
  }),

  eventInvitation: (eventData, invitedByUser) => ({
    title: '📅 Event Invitation - LifeStock',
    body: `${invitedByUser} invited you to "${eventData.title}" on ${new Date(eventData.startDate).toLocaleDateString()}`,
    icon: '/icons/event-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'event-invitation',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Event',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'accept',
        title: 'Accept',
        icon: '/icons/accept-icon.png'
      }
    ],
    data: {
      type: 'event-invitation',
      eventId: eventData._id,
      url: '/calendar'
    }
  }),

  eventReminder: (eventData) => ({
    title: '⏰ Event Reminder - LifeStock',
    body: `"${eventData.title}" starts ${new Date(eventData.startDate).toLocaleTimeString()} today`,
    icon: '/icons/event-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'event-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Event',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    data: {
      type: 'event-reminder',
      eventId: eventData._id,
      url: '/calendar'
    }
  }),

  sharedListInvite: (listData, invitedByUser) => ({
    title: '📝 Shared List Invitation - LifeStock',
    body: `${invitedByUser} invited you to collaborate on "${listData.name || listData.title}"`,
    icon: '/icons/list-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'list-invitation',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View List',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'accept',
        title: 'Accept',
        icon: '/icons/accept-icon.png'
      }
    ],
    data: {
      type: 'list-invitation',
      listId: listData._id,
      url: '/shared-lists'
    }
  }),

  welcome: (userData) => ({
    title: '🎉 Welcome to LifeStock!',
    body: `Hi ${userData.username}! Your account is ready. Start organizing your life now.`,
    icon: '/icons/welcome-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'welcome',
    requireInteraction: true,
    actions: [
      {
        action: 'start',
        title: 'Get Started',
        icon: '/icons/start-icon.png'
      }
    ],
    data: {
      type: 'welcome',
      userId: userData._id,
      url: '/dashboard'
    }
  })
};

// Helper functions for sending specific notifications
const sendTaskSharedNotification = async (subscription, taskData, sharedByUser) => {
  const payload = notificationTemplates.taskShared(taskData, sharedByUser);
  return await sendPushNotification(subscription, payload);
};

const sendTaskReminderNotification = async (subscription, taskData) => {
  const payload = notificationTemplates.taskReminder(taskData);
  return await sendPushNotification(subscription, payload);
};

const sendEventInvitationNotification = async (subscription, eventData, invitedByUser) => {
  const payload = notificationTemplates.eventInvitation(eventData, invitedByUser);
  return await sendPushNotification(subscription, payload);
};

const sendEventReminderNotification = async (subscription, eventData) => {
  const payload = notificationTemplates.eventReminder(eventData);
  return await sendPushNotification(subscription, payload);
};

const sendSharedListInviteNotification = async (subscription, listData, invitedByUser) => {
  const payload = notificationTemplates.sharedListInvite(listData, invitedByUser);
  return await sendPushNotification(subscription, payload);
};

const sendWelcomeNotification = async (subscription, userData) => {
  const payload = notificationTemplates.welcome(userData);
  return await sendPushNotification(subscription, payload);
};

// Send notification to multiple subscriptions
const sendNotificationToUser = async (userId, payload) => {
  try {
    // Get user's push subscriptions from database
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return { success: false, error: 'No subscriptions found' };
    }

    const results = [];
    for (const subscription of user.pushSubscriptions) {
      try {
        const result = await sendPushNotification(subscription, payload);
        results.push(result);
      } catch (error) {
        console.error('Failed to send to subscription:', error);
        // Remove invalid subscription
        user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        await user.save();
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVapidKeys,
  sendPushNotification,
  sendTaskSharedNotification,
  sendTaskReminderNotification,
  sendEventInvitationNotification,
  sendEventReminderNotification,
  sendSharedListInviteNotification,
  sendWelcomeNotification,
  sendNotificationToUser,
  notificationTemplates
};
