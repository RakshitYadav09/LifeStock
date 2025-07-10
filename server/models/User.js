const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  pushSubscriptions: [{
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified and not a Google user
  if (!this.isModified('password') || this.isGoogleUser) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
