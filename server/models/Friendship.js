const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique friendship pairs
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;
