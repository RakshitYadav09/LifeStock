const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const { notificationHelpers } = require('./notificationController');
const { sendNotificationToUser, notificationTemplates } = require('../utils/pushNotificationService');

// Create calendar event
const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, isAllDay, participants } = req.body;
    const creatorId = req.user.id;

    // Validate participants if provided
    if (participants && participants.length > 0) {
      // Check if all participants are friends with the creator
      const friendships = await Friendship.find({
        $or: [
          { requester: creatorId, recipient: { $in: participants }, status: 'accepted' },
          { recipient: creatorId, requester: { $in: participants }, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(f => 
        f.requester.toString() === creatorId ? f.recipient.toString() : f.requester.toString()
      );

      const invalidParticipants = participants.filter(p => !friendIds.includes(p));
      if (invalidParticipants.length > 0) {
        return res.status(400).json({ 
          message: "You can only add friends as participants",
          invalidParticipants 
        });
      }
    }

    console.log('Creating event with participants:', participants);
    
    const event = new CalendarEvent({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isAllDay: isAllDay || false,
      creator: creatorId,
      participants: participants || []
    });

    await event.save();
    
    await event.populate('creator', 'username email name');
    await event.populate('participants', 'username email name');

    console.log('Saved event with participants:', event.participants);

    // Send notifications to participants
    if (participants && participants.length > 0) {
      const creator = await User.findById(creatorId);
      
      for (const participantId of participants) {
        try {
          // Send in-app notification
          await notificationHelpers.calendarInvite(creatorId, participantId, event._id, title);
          
          // Send push notification
          const participant = await User.findById(participantId).select('email name username');
          if (participant) {
            try {
              const payload = notificationTemplates.eventInvitation(event, creator.username || creator.name);
              await sendNotificationToUser(participantId, payload);
              console.log(`Event invitation notification sent to ${participant.username}`);
            } catch (notificationError) {
              console.error('Failed to send event invitation notification:', notificationError);
              // Don't fail the event creation if notification fails
            }
          }
        } catch (error) {
          console.error('Error sending calendar invite notification:', error);
        }
      }
    }

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Invalid event data", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Unable to create event. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get user's events
const getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = {
      $or: [
        { creator: userId },
        { participants: userId }
      ]
    };

    // Add date filtering if provided
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await CalendarEvent.find(query)
      .populate('creator', 'username email')
      .populate('participants', 'username email')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      message: "Unable to load calendar events. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await CalendarEvent.findById(eventId)
      .populate('creator', 'username email')
      .populate('participants', 'username email');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user has access to this event
    const hasAccess = event.creator._id.toString() === userId || 
                     event.participants.some(p => p._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "You don't have access to this event" });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      message: "Unable to load event details. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only creator can update the event
    if (event.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the event creator can update this event" });
    }

    // Validate participants if being updated
    if (updates.participants) {
      const friendships = await Friendship.find({
        $or: [
          { requester: userId, recipient: { $in: updates.participants }, status: 'accepted' },
          { recipient: userId, requester: { $in: updates.participants }, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(f => 
        f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString()
      );

      const invalidParticipants = updates.participants.filter(p => !friendIds.includes(p));
      if (invalidParticipants.length > 0) {
        return res.status(400).json({ 
          message: "You can only add friends as participants",
          invalidParticipants 
        });
      }
    }

    // Update dates if provided
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      eventId,
      updates,
      { new: true, runValidators: true }
    ).populate('creator', 'username email')
     .populate('participants', 'username email');

    res.json({
      message: "Event updated successfully",
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Invalid event data", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Unable to update event. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only creator can delete the event
    if (event.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the event creator can delete this event" });
    }

    await CalendarEvent.findByIdAndDelete(eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      message: "Unable to delete event. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Add participant to event
const addParticipant = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participantId } = req.body;
    const userId = req.user.id;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only creator can add participants
    if (event.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the event creator can add participants" });
    }

    // Check if user is already a participant
    if (event.participants.includes(participantId)) {
      return res.status(400).json({ message: "User is already a participant" });
    }

    // Check if participant is a friend
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: participantId, status: 'accepted' },
        { recipient: userId, requester: participantId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(400).json({ message: "You can only add friends as participants" });
    }

    event.participants.push(participantId);
    await event.save();

    await event.populate('creator', 'username email');
    await event.populate('participants', 'username email');

    res.json({
      message: "Participant added successfully",
      event
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ 
      message: "Unable to add participant. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Remove participant from event
const removeParticipant = async (req, res) => {
  try {
    const { eventId, participantId } = req.params;
    const userId = req.user.id;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Creator can remove anyone, participants can remove themselves
    const canRemove = event.creator.toString() === userId || participantId === userId;
    if (!canRemove) {
      return res.status(403).json({ message: "You don't have permission to remove this participant" });
    }

    event.participants = event.participants.filter(p => p.toString() !== participantId);
    await event.save();

    await event.populate('creator', 'username email');
    await event.populate('participants', 'username email');

    res.json({
      message: "Participant removed successfully",
      event
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ 
      message: "Unable to remove participant. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addParticipant,
  removeParticipant
};
