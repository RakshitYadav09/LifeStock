const mongoose = require('mongoose');

const sharedListSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['grocery', 'expense', 'todo', 'custom'], 
    default: 'custom' 
  },
  items: [{
    text: { 
      type: String, 
      required: true,
      trim: true
    },
    quantity: { 
      type: String,
      trim: true
    },
    completed: { 
      type: Boolean, 
      default: false 
    },
    dueDate: { 
      type: Date 
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    notes: {
      type: String,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date
    }
  }],
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  collaborators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true
});

const SharedList = mongoose.model('SharedList', sharedListSchema);

module.exports = SharedList;
