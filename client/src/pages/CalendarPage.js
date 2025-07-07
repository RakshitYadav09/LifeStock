import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Plus, X, Save, Trash2, Users, Clock, Lock } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';
import { useNotification } from '../context/NotificationContext';
import AuthContext from '../context/AuthContext';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../services/api';
import '../styles/calendar.css';

const CalendarPage = () => {
  const { calendarEvents, friends, refreshCalendarEvents } = useCollaboration();
  const { showSuccess, showError, showWarning } = useNotification();
  const { user } = useContext(AuthContext);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    participants: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user can edit/delete an event
  const canModifyEvent = (event) => {
    if (!event || !event.creator || !user) return false;
    // Handle both _id and id fields for user
    const userId = user._id || user.id;
    const creatorId = event.creator._id || event.creator.id;
    return creatorId === userId;
  };

  useEffect(() => {
    refreshCalendarEvents();
  }, [refreshCalendarEvents]);

  // Get event color based on participants or type
  const getEventColor = (event, border = false) => {
    // Check if event has participants (shared event)
    if (event.participants && event.participants.length > 0) {
      return border ? '#16a34a' : '#22c55e'; // Green for collaborative events
    }
    return border ? '#22c55e' : '#4ade80'; // Light green for personal events
  };

  // Transform events for FullCalendar
  const calendarEventsFormatted = calendarEvents.map(event => {
    return {
      id: event._id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      allDay: event.isAllDay,
      extendedProps: {
        description: event.description,
        participants: event.participants,
        originalEvent: event
      },
      backgroundColor: getEventColor(event),
      borderColor: getEventColor(event, true)
    };
  });

  // Handle date/time selection
  const handleDateSelect = (selectInfo) => {
    setSelectedEvent(null);
    const start = selectInfo.start;
    const end = selectInfo.end;
    
    // Format dates for datetime-local input
    const formatForInput = (date) => {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    setEventForm({
      title: '',
      description: '',
      startDate: formatForInput(start),
      endDate: formatForInput(end),
      isAllDay: selectInfo.allDay,
      participants: []
    });
    setShowEventModal(true);
  };

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const originalEvent = event.extendedProps.originalEvent;
    
    // Check if user can modify this event
    if (!canModifyEvent(originalEvent)) {
      showWarning('You can only edit events that you created. This event was created by someone else.');
      return;
    }
    
    setSelectedEvent(originalEvent);
    
    const formatForInput = (date) => {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    setEventForm({
      title: event.title,
      description: event.extendedProps.description || '',
      startDate: formatForInput(event.start),
      endDate: formatForInput(event.end || event.start),
      isAllDay: event.allDay,
      participants: originalEvent.participants ? originalEvent.participants.map(p => p._id) : []
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      showWarning('Please enter a title for your event.');
      return;
    }

    // Additional validation for editing events
    if (selectedEvent && !canModifyEvent(selectedEvent)) {
      showError('You can only edit events that you created.');
      return;
    }

    // Debug logging
    
    setIsLoading(true);
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        isAllDay: eventForm.isAllDay,
        participants: eventForm.participants
      };

      if (selectedEvent) {
        await updateCalendarEvent(selectedEvent._id, eventData);
        showSuccess('Event updated successfully!');
      } else {
        await createCalendarEvent(eventData);
        showSuccess('Event created successfully!');
      }

      await refreshCalendarEvents();
      setShowEventModal(false);
      resetForm();
    } catch (error) {
      console.error('Calendar event save error:', error);
      // Handle specific error cases
      if (error.response?.status === 403) {
        showError('You do not have permission to modify this event.');
      } else if (error.response?.status === 400) {
        showError(error.response.data.message || 'Invalid event data. Please check your inputs.');
      } else {
        showError('Failed to save event. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    // Check permission before attempting delete
    if (!canModifyEvent(selectedEvent)) {
      showError('You can only delete events that you created.');
      return;
    }

    setIsLoading(true);
    try {
      await deleteCalendarEvent(selectedEvent._id);
      showSuccess('Event deleted successfully!');
      await refreshCalendarEvents();
      setShowEventModal(false);
      resetForm();
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        showError('You do not have permission to delete this event.');
      } else if (error.response?.status === 404) {
        showError('Event not found. It may have already been deleted.');
      } else {
        showError('Failed to delete event. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      isAllDay: false,
      participants: []
    });
    setSelectedEvent(null);
  };

  const closeModal = () => {
    setShowEventModal(false);
    resetForm();
  };

  const handleParticipantToggle = (friendId) => {
    setEventForm(prev => ({
      ...prev,
      participants: prev.participants.includes(friendId)
        ? prev.participants.filter(id => id !== friendId)
        : [...prev.participants, friendId]
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-500 p-3 rounded-xl shadow-lg">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">Calendar</h1>
                <p className="text-neutral-600 mt-1">Manage your events and schedule</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedEvent(null);
                const now = new Date();
                const formatForInput = (date) => {
                  const d = new Date(date);
                  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                  return d.toISOString().slice(0, 16);
                };
                setEventForm({
                  title: '',
                  description: '',
                  startDate: formatForInput(now),
                  endDate: formatForInput(new Date(now.getTime() + 60 * 60 * 1000)),
                  isAllDay: false,
                  participants: []
                });
                setShowEventModal(true);
              }}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">New Event</span>
            </button>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4">
          <div style={{ minHeight: '600px' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              events={calendarEventsFormatted}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
            />
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              <div className="bg-primary-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedEvent ? 'Edit Event' : 'New Event'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }} className="space-y-6">
                  {/* Permission Notice for Edit */}
                  {selectedEvent && !canModifyEvent(selectedEvent) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                      <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                        <Lock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-amber-800 font-medium text-sm">Read-only Event</p>
                        <p className="text-amber-700 text-sm mt-1">
                          This event was created by {selectedEvent.creator?.username || 'another user'}. 
                          You can view the details but cannot make changes.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter event title"
                      required
                      disabled={selectedEvent && !canModifyEvent(selectedEvent)}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Enter event description"
                      rows={3}
                      disabled={selectedEvent && !canModifyEvent(selectedEvent)}
                    />
                  </div>

                  {/* All Day Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={eventForm.isAllDay}
                      onChange={(e) => setEventForm(prev => ({ ...prev, isAllDay: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      disabled={selectedEvent && !canModifyEvent(selectedEvent)}
                    />
                    <label htmlFor="allDay" className="ml-3 block text-sm font-medium text-neutral-700">
                      All day event
                    </label>
                  </div>

                  {/* Start Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Start {eventForm.isAllDay ? 'Date' : 'Date & Time'}
                    </label>
                    <input
                      type={eventForm.isAllDay ? "date" : "datetime-local"}
                      value={eventForm.isAllDay ? eventForm.startDate.split('T')[0] : eventForm.startDate}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (eventForm.isAllDay) {
                          value = `${value}T00:00`;
                        }
                        setEventForm(prev => ({ ...prev, startDate: value }));
                      }}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={selectedEvent && !canModifyEvent(selectedEvent)}
                    />
                  </div>

                  {/* End Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-2" />
                      End {eventForm.isAllDay ? 'Date' : 'Date & Time'}
                    </label>
                    <input
                      type={eventForm.isAllDay ? "date" : "datetime-local"}
                      value={eventForm.isAllDay ? eventForm.endDate.split('T')[0] : eventForm.endDate}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (eventForm.isAllDay) {
                          value = `${value}T23:59`;
                        }
                        setEventForm(prev => ({ ...prev, endDate: value }));
                      }}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={selectedEvent && !canModifyEvent(selectedEvent)}
                    />
                  </div>

                  {/* Participants */}
                  {friends && friends.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        <Users className="inline h-4 w-4 mr-2" />
                        Invite Friends ({friends.length} available)
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-neutral-200 rounded-xl p-3 bg-neutral-50">
                        {friends.map((friend) => (
                          <div key={friend._id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`friend-${friend._id}`}
                              checked={eventForm.participants.includes(friend._id)}
                              onChange={() => handleParticipantToggle(friend._id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                              disabled={selectedEvent && !canModifyEvent(selectedEvent)}
                            />
                            <label htmlFor={`friend-${friend._id}`} className="ml-3 block text-sm text-neutral-700">
                              {friend.username}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!friends || friends.length === 0) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-700 text-sm">
                        No friends available to invite. Add friends first to share events with them.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-6 border-t border-neutral-200">
                    <div>
                      {selectedEvent && canModifyEvent(selectedEvent) && (
                        <button
                          type="button"
                          onClick={handleDeleteEvent}
                          disabled={isLoading}
                          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-all duration-200 font-medium"
                      >
                        {selectedEvent && !canModifyEvent(selectedEvent) ? 'Close' : 'Cancel'}
                      </button>
                      {(!selectedEvent || canModifyEvent(selectedEvent)) && (
                        <button
                          type="submit"
                          disabled={isLoading || !eventForm.title.trim()}
                          className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 disabled:opacity-50 flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Save className="h-4 w-4" />
                          <span>{isLoading ? 'Saving...' : 'Save'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
