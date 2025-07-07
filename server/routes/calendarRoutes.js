const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addParticipant,
  removeParticipant
} = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   POST /api/calendar
// @desc    Create calendar event
// @access  Private
router.post('/', createEvent);

// @route   GET /api/calendar
// @desc    Get user's calendar events
// @access  Private
router.get('/', getEvents);

// @route   GET /api/calendar/:eventId
// @desc    Get single calendar event
// @access  Private
router.get('/:eventId', getEvent);

// @route   PUT /api/calendar/:eventId
// @desc    Update calendar event
// @access  Private
router.put('/:eventId', updateEvent);

// @route   DELETE /api/calendar/:eventId
// @desc    Delete calendar event
// @access  Private
router.delete('/:eventId', deleteEvent);

// @route   POST /api/calendar/:eventId/participants
// @desc    Add participant to event
// @access  Private
router.post('/:eventId/participants', addParticipant);

// @route   DELETE /api/calendar/:eventId/participants/:participantId
// @desc    Remove participant from event
// @access  Private
router.delete('/:eventId/participants/:participantId', removeParticipant);

module.exports = router;
