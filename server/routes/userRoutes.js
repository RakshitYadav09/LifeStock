const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, authUser, googleLogin } = require('../controllers/userController');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Configure trusted proxies - 1 means trust the first hop (Render's proxy)
  trustProxy: 1
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, authUser);
router.post('/google-login', authLimiter, googleLogin);

module.exports = router;
