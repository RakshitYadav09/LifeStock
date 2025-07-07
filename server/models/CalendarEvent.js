const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  location: { 
    type: String,
    trim: true
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Validation to ensure endDate is after startDate (if not all-day event)
calendarEventSchema.pre('save', function(next) {
  if (!this.isAllDay && this.endDate <= this.startDate) {
    const error = new Error('End date must be after start date');
    return next(error);
  }
  next();
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
