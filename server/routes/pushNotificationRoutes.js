const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateVapidKeys, sendNotificationToUser } = require('../utils/pushNotificationService');
const { protect } = require('../middleware/authMiddleware');

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({ 
    publicKey: process.env.VAPID_PUBLIC_KEY || 'not-configured'
  });
});

// Generate VAPID keys (development only)
router.get('/generate-vapid-keys', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }
  
  const keys = generateVapidKeys();
  res.json(keys);
});

// Subscribe to push notifications
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if subscription already exists
    const existingSubscription = user.pushSubscriptions.find(
      sub => sub.endpoint === subscription.endpoint
    );

    if (!existingSubscription) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.json({ 
      message: 'Subscription added successfully',
      subscriptionCount: user.pushSubscriptions.length
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ message: 'Failed to subscribe to notifications' });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pushSubscriptions = user.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );
    await user.save();

    res.json({ 
      message: 'Unsubscribed successfully',
      subscriptionCount: user.pushSubscriptions.length
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ message: 'Failed to unsubscribe from notifications' });
  }
});

// Send test notification
router.post('/test', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message = 'Test notification from LifeStock!' } = req.body;

    const payload = {
      title: '🔔 Test Notification',
      body: message,
      icon: '/icons/test-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'test',
      data: {
        type: 'test',
        url: '/dashboard'
      }
    };

    const result = await sendNotificationToUser(userId, payload);
    
    if (result.success) {
      res.json({ message: 'Test notification sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send test notification', error: result.error });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Failed to send test notification' });
  }
});

// Get user's subscription status
router.get('/status', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      subscribed: user.pushSubscriptions.length > 0,
      subscriptionCount: user.pushSubscriptions.length,
      vapidConfigured: !!process.env.VAPID_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ message: 'Failed to get subscription status' });
  }
});

module.exports = router;
