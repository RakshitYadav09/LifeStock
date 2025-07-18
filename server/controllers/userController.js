const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendNotificationToUser, notificationTemplates } = require('../utils/pushNotificationService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      // Send welcome notification (will be sent when user subscribes to push notifications)
      // The welcome notification will be triggered from the frontend after subscription
      console.log(`User ${user.username} registered successfully`);

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate User (Login)
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth Login
const googleLogin = async (req, res) => {
  try {
    const { token, email, name, picture } = req.body;

    if (!token || !email) {
      return res.status(400).json({ message: 'Google token and email are required' });
    }

    // Verify the Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const googleUserId = payload['sub'];
    const googleEmail = payload['email'];
    const googleName = payload['name'];
    const googlePicture = payload['picture'];

    // Verify the email matches
    if (googleEmail !== email) {
      return res.status(400).json({ message: 'Email mismatch' });
    }

    // Check if user exists
    let user = await User.findOne({ email: googleEmail });
    let isNewUser = false;

    if (user) {
      // Update user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleUserId;
        user.profilePicture = googlePicture;
        await user.save();
      }
    } else {
      // Create new user
      isNewUser = true;
      user = await User.create({
        username: googleName || email.split('@')[0],
        email: googleEmail,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        googleId: googleUserId,
        profilePicture: googlePicture,
        isGoogleUser: true
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: jwtToken,
      isNewUser: isNewUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Check if username is already taken by another user
    if (username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: userId } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Update user profile
    user.username = username;
    user.email = email;
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    // Return updated user data
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

module.exports = {
  registerUser,
  authUser,
  googleLogin,
  updateUserProfile
};
