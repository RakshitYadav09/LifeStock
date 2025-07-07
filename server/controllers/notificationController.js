const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper function to create notifications
const createNotification = async (notificationData) => {
  try {
    // Ensure recipient and sender are proper ObjectIds
    const cleanedData = {
      ...notificationData,
      recipient: typeof notificationData.recipient === 'object' 
        ? notificationData.recipient._id || notificationData.recipient 
        : notificationData.recipient,
      sender: typeof notificationData.sender === 'object' 
        ? notificationData.sender._id || notificationData.sender 
        : notificationData.sender
    };
    
    const notification = new Notification(cleanedData);
    await notification.save();
    await notification.populate('sender', 'username email');
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, isRead } = req.query;

    const query = { recipient: userId };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    ).populate('sender', 'username email');

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Notification helpers for different events
const notificationHelpers = {
  // Friend request notifications
  friendRequest: async (senderId, recipientId) => {
    const sender = await User.findById(senderId);
    return createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${sender.username} sent you a friend request`,
      actionUrl: '/friends',
      priority: 'medium'
    });
  },

  friendAccepted: async (senderId, recipientId) => {
    const sender = await User.findById(senderId);
    return createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${sender.username} accepted your friend request`,
      actionUrl: '/friends',
      priority: 'medium'
    });
  },

  // Task notifications
  taskShared: async (senderId, recipientId, taskId, taskTitle) => {
    const sender = await User.findById(senderId);
    return createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'task_shared',
      title: 'Task Shared With You',
      message: `${sender.username} shared the task "${taskTitle}" with you`,
      relatedId: taskId,
      relatedModel: 'Task',
      actionUrl: '/shared-tasks',
      priority: 'medium'
    });
  },

  taskAssigned: async (senderId, recipientId, taskId, taskTitle) => {
    const sender = await User.findById(senderId);
    return createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'task_assigned',
      title: 'Task Assigned to You',
      message: `${sender.username} assigned the task "${taskTitle}" to you`,
      relatedId: taskId,
      relatedModel: 'Task',
      actionUrl: '/shared-tasks',
      priority: 'high'
    });
  },

  // List notifications
  listShared: async (senderId, recipientId, listId, listTitle) => {
    const sender = await User.findById(senderId);
    return createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'list_shared',
      title: 'List Shared With You',
      message: `${sender.username} shared the list "${listTitle}" with you`,
      relatedId: listId,
      relatedModel: 'SharedList',
      actionUrl: `/shared-lists/${listId}`,
      priority: 'medium'
    });
  },

  listItemAdded: async (senderId, recipientIds, listId, listTitle, itemText) => {
    const sender = await User.findById(senderId);
    const notifications = [];
    
    for (const recipientId of recipientIds) {
      const notification = await createNotification({
        recipient: recipientId,
        sender: senderId,
        type: 'list_item_added',
        title: 'New Item Added',
        message: `${sender.username} added "${itemText}" to "${listTitle}"`,
        relatedId: listId,
        relatedModel: 'SharedList',
        actionUrl: `/shared-lists/${listId}`,
        priority: 'low'
      });
      notifications.push(notification);
    }
    
    return notifications;
  },

  // Calendar notifications
  calendarInvite: async (senderId, recipientId, eventId, eventTitle) => {
    const sender = await User.findById(senderId);
    return createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'calendar_invite',
      title: 'Calendar Invitation',
      message: `${sender.username} invited you to "${eventTitle}"`,
      relatedId: eventId,
      relatedModel: 'CalendarEvent',
      actionUrl: '/calendar',
      priority: 'medium'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  notificationHelpers
};
