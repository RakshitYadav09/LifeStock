const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private
router.put('/:notificationId/read', markAsRead);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', markAllAsRead);

// @route   DELETE /api/notifications/:notificationId
// @desc    Delete notification
// @access  Private
router.delete('/:notificationId', deleteNotification);

module.exports = router;
