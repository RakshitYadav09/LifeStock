import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Plus, X, Save, Trash2, Users, Clock, Lock, Grid, List, CalendarDays, Eye } from 'lucide-react';
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
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null); // For read-only viewing
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    participants: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // View options with responsive considerations
  const viewOptions = [
    { 
      id: 'dayGridMonth', 
      label: 'Month', 
      icon: Grid, 
      mobile: true,
      description: 'Monthly overview'
    },
    { 
      id: 'timeGridWeek', 
      label: 'Week', 
      icon: CalendarDays, 
      mobile: false,
      description: 'Weekly schedule'
    },
    { 
      id: 'timeGridDay', 
      label: 'Day', 
      icon: Clock, 
      mobile: true,
      description: 'Daily agenda'
    },
    { 
      id: 'listWeek', 
      label: 'List', 
      icon: List, 
      mobile: true,
      description: 'Event list'
    }
  ];

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
    
    const formatForInput = (date) => {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    // Always allow viewing, but check if user can modify
    if (canModifyEvent(originalEvent)) {
      setSelectedEvent(originalEvent);
      setViewingEvent(null);
    } else {
      setViewingEvent(originalEvent);
      setSelectedEvent(null);
    }
    
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
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
          {/* View Toggle for Mobile */}
          <div className="p-4 border-b border-neutral-200 md:hidden">
            <div className="relative">
              <button
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="w-full flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200"
              >
                <div className="flex items-center space-x-2">
                  {React.createElement(
                    viewOptions.find(v => v.id === currentView)?.icon || Grid,
                    { className: "h-5 w-5 text-neutral-600" }
                  )}
                  <span className="font-medium text-neutral-800">
                    {viewOptions.find(v => v.id === currentView)?.label || 'Month'}
                  </span>
                </div>
                <X className={`h-4 w-4 text-neutral-500 transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isViewDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 z-10">
                  {viewOptions.filter(view => view.mobile).map((view) => (
                    <button
                      key={view.id}
                      onClick={() => {
                        setCurrentView(view.id);
                        setIsViewDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-neutral-50 first:rounded-t-xl last:rounded-b-xl ${
                        currentView === view.id ? 'bg-primary-50 text-primary-700' : 'text-neutral-700'
                      }`}
                    >
                      <view.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{view.label}</div>
                        <div className="text-xs text-neutral-500">{view.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* View Toggle for Desktop */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center space-x-2 bg-neutral-100 rounded-xl p-1">
              {viewOptions.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === view.id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <view.icon className="h-4 w-4" />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
            
            <div className="text-sm text-neutral-500">
              {viewOptions.find(v => v.id === currentView)?.description}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-2 sm:p-4">
            <div style={{ minHeight: '400px' }} className="sm:min-h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today'
                }}
                initialView={currentView}
                key={currentView} // Force re-render when view changes
                editable={true}
                selectable={true}
                events={calendarEventsFormatted}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={window.innerWidth < 768 ? 0.6 : 1.35}
                dayMaxEvents={window.innerWidth < 768 ? 2 : 4}
                moreLinkClick="popover"
                eventDisplay="block"
                displayEventTime={currentView !== 'dayGridMonth'}
                eventTextColor="#ffffff"
                eventBorderWidth={0}
                eventClassNames="cursor-pointer fc-event-truncate"
                // Mobile optimizations
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                expandRows={true}
                // List view specific settings
                listDayFormat={{ weekday: 'long', month: 'short', day: 'numeric' }}
                listDaySideFormat={false}
                // Better event text handling and full title visibility
                eventDidMount={(info) => {
                  // Add tooltip for better mobile experience
                  const event = info.event;
                  const tooltip = `${event.title}${event.extendedProps.description ? '\n' + event.extendedProps.description : ''}`;
                  info.el.setAttribute('title', tooltip);
                  
                  // Ensure full event names are visible in list view
                  if (currentView === 'listWeek') {
                    const titleEl = info.el.querySelector('.fc-list-event-title');
                    if (titleEl) {
                      titleEl.style.whiteSpace = 'normal';
                      titleEl.style.overflow = 'visible';
                      titleEl.style.textOverflow = 'clip';
                      titleEl.style.maxWidth = 'none';
                    }
                  }
                  
                  // Improve event text visibility in grid views
                  const eventTitleEl = info.el.querySelector('.fc-event-title');
                  if (eventTitleEl) {
                    eventTitleEl.style.fontSize = '0.75rem';
                    eventTitleEl.style.lineHeight = '1.1';
                    eventTitleEl.style.fontWeight = '500';
                    // Allow text wrapping for better visibility on mobile
                    if (window.innerWidth < 768) {
                      eventTitleEl.style.whiteSpace = 'normal';
                      eventTitleEl.style.overflow = 'visible';
                    }
                  }
                  
                  // Add visual indicator for read-only events
                  if (!canModifyEvent(event.extendedProps.originalEvent)) {
                    const eyeIcon = document.createElement('span');
                    eyeIcon.innerHTML = '👁️';
                    eyeIcon.className = 'absolute top-0 right-0 text-xs opacity-75 z-10';
                    eyeIcon.style.fontSize = '10px';
                    eyeIcon.style.pointerEvents = 'none';
                    info.el.style.position = 'relative';
                    info.el.appendChild(eyeIcon);
                  }
                }}
                // Handle window resize for better responsiveness
                windowResize={() => {
                  // Recalculate aspect ratio on resize
                  return {
                    aspectRatio: window.innerWidth < 768 ? 0.6 : 1.35
                  };
                }}
                // Improve mobile interaction
                eventStartEditable={true}
                eventDurationEditable={true}
                // Better mobile touch handling
                longPressDelay={300}
                eventLongPressDelay={300}
              />
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-scale-in">
              <div className={`px-4 sm:px-6 py-3 sm:py-4 ${
                viewingEvent ? 'bg-neutral-500' : 'bg-primary-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {viewingEvent && (
                      <Eye className="h-5 w-5 text-white" />
                    )}
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      {viewingEvent ? 'View Event' : selectedEvent ? 'Edit Event' : 'New Event'}
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }} className="space-y-4 sm:space-y-6">
                  {/* Permission Notice for Read-only */}
                  {viewingEvent && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                      <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-blue-800 font-medium text-sm">Event Details</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Created by {viewingEvent.creator?.username || 'another user'}. 
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
                      className={`w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        viewingEvent ? 'bg-neutral-50' : ''
                      }`}
                      placeholder="Enter event title"
                      required
                      disabled={!!viewingEvent}
                      readOnly={!!viewingEvent}
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
                      className={`w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none ${
                        viewingEvent ? 'bg-neutral-50' : ''
                      }`}
                      placeholder="Enter event description"
                      rows={3}
                      disabled={!!viewingEvent}
                      readOnly={!!viewingEvent}
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
                      disabled={!!viewingEvent}
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
                      className={`w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        viewingEvent ? 'bg-neutral-50' : ''
                      }`}
                      required
                      disabled={!!viewingEvent}
                      readOnly={!!viewingEvent}
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
                      className={`w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        viewingEvent ? 'bg-neutral-50' : ''
                      }`}
                      required
                      disabled={!!viewingEvent}
                      readOnly={!!viewingEvent}
                    />
                  </div>

                  {/* Participants */}
                  {friends && friends.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        <Users className="inline h-4 w-4 mr-2" />
                        {viewingEvent ? 'Participants' : 'Invite Friends'} ({friends.length} available)
                      </label>
                      <div className={`space-y-2 max-h-32 overflow-y-auto border border-neutral-200 rounded-xl p-3 ${
                        viewingEvent ? 'bg-neutral-50' : 'bg-neutral-50'
                      }`}>
                        {friends.map((friend) => (
                          <div key={friend._id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`friend-${friend._id}`}
                              checked={eventForm.participants.includes(friend._id)}
                              onChange={() => handleParticipantToggle(friend._id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                              disabled={!!viewingEvent}
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
                        Close
                      </button>
                      {((!selectedEvent && !viewingEvent) || (selectedEvent && canModifyEvent(selectedEvent))) && (
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
