const Friendship = require('../models/Friendship');
const User = require('../models/User');
const { notificationHelpers } = require('./notificationController');

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user.id;

    if (requesterId === recipientId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: "Friend request already exists or you are already friends" });
    }

    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await friendship.save();
    
    // Populate the friendship with user details
    await friendship.populate('requester', 'username email');
    await friendship.populate('recipient', 'username email');

    // Send notification to recipient
    try {
      await notificationHelpers.friendRequest(requesterId, recipientId);
    } catch (notifError) {
      console.error('Error sending friend request notification:', notifError);
    }

    res.status(201).json({
      message: "Friend request sent successfully",
      friendship
    });
  } catch (error) {
    console.error('Friend request error:', error);
    
    // Provide more specific error messages
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "A friend request between these users already exists" 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Invalid friend request data", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Unable to send friend request. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendship.recipient.toString() !== userId) {
      return res.status(403).json({ message: "You can only accept friend requests sent to you" });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: "This friend request is no longer pending" });
    }

    friendship.status = 'accepted';
    friendship.acceptedAt = new Date();
    await friendship.save();

    await friendship.populate('requester', 'username email');
    await friendship.populate('recipient', 'username email');

    // Send notification to requester that their request was accepted
    try {
      await notificationHelpers.friendAccepted(userId, friendship.requester._id);
    } catch (notifError) {
      console.error('Error sending friend accepted notification:', notifError);
    }

    res.json({
      message: "Friend request accepted",
      friendship
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ 
      message: "Unable to accept friend request. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendship.recipient.toString() !== userId) {
      return res.status(403).json({ message: "You can only reject friend requests sent to you" });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: "This friend request is no longer pending" });
    }

    await Friendship.findByIdAndDelete(friendshipId);

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ 
      message: "Unable to reject friend request. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get friends list
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('requester', 'username email')
      .populate('recipient', 'username email');

    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId 
        ? friendship.recipient 
        : friendship.requester;
      return {
        _id: friend._id,
        username: friend.username,
        email: friend.email,
        friendshipId: friendship._id,
        friendsSince: friendship.acceptedAt
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      message: "Unable to load friends list. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get pending friend requests
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await Friendship.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'username email');

    res.json(pendingRequests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ 
      message: "Unable to load pending requests. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get sent friend requests
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const sentRequests = await Friendship.find({
      requester: userId,
      status: 'pending'
    }).populate('recipient', 'username email');

    res.json(sentRequests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ 
      message: "Unable to load sent requests. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Remove friend
const removeFriend = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    if (friendship.requester.toString() !== userId && friendship.recipient.toString() !== userId) {
      return res.status(403).json({ message: "You can only remove your own friendships" });
    }

    await Friendship.findByIdAndDelete(friendshipId);

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      message: "Unable to remove friend. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Search users (for sending friend requests)
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters long" });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username email').limit(10);

    // Get existing friendships to filter out already connected users
    const existingFriendships = await Friendship.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    const connectedUserIds = existingFriendships.map(f => 
      f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString()
    );

    const availableUsers = users.filter(user => 
      !connectedUserIds.includes(user._id.toString())
    );

    res.json(availableUsers);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      message: "Unable to search users. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  searchUsers
};
