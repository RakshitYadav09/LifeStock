const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  searchUsers
} = require('../controllers/friendshipController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   POST /api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', sendFriendRequest);

// @route   PUT /api/friends/accept/:friendshipId
// @desc    Accept friend request
// @access  Private
router.put('/accept/:friendshipId', acceptFriendRequest);

// @route   DELETE /api/friends/reject/:friendshipId
// @desc    Reject friend request
// @access  Private
router.delete('/reject/:friendshipId', rejectFriendRequest);

// @route   GET /api/friends
// @desc    Get friends list
// @access  Private
router.get('/', getFriends);

// @route   GET /api/friends/pending
// @desc    Get pending friend requests
// @access  Private
router.get('/pending', getPendingRequests);

// @route   GET /api/friends/sent
// @desc    Get sent friend requests
// @access  Private
router.get('/sent', getSentRequests);

// @route   DELETE /api/friends/:friendshipId
// @desc    Remove friend
// @access  Private
router.delete('/:friendshipId', removeFriend);

// @route   GET /api/friends/search
// @desc    Search users for friend requests
// @access  Private
router.get('/search', searchUsers);

module.exports = router;
