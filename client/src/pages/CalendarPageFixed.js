import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Calendar as CalendarIcon, Grid, List, ChevronLeft, ChevronRight, Plus, X, Save, Trash2 } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Initialize the localizer with moment (which is already installed)
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { calendarEvents, friends, refreshCalendarEvents } = useCollaboration();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    participants: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Simple notification system for this component
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n._id !== newNotification._id));
    }, 5000);
  };

  useEffect(() => {
    refreshCalendarEvents();
  }, [refreshCalendarEvents]);

  // Transform events for react-big-calendar
  const calendarEventsFormatted = calendarEvents.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    allDay: event.isAllDay,
    resource: event
  }));

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      startDate: moment(start).format('YYYY-MM-DDTHH:mm'),
      endDate: moment(end).format('YYYY-MM-DDTHH:mm'),
      isAllDay: false,
      participants: []
    });
    setShowEventModal(true);
  };

  const handleSelectEvent = (event) => {
    const eventData = event.resource;
    setSelectedEvent(eventData);
    setEventForm({
      title: eventData.title,
      description: eventData.description || '',
      startDate: moment(eventData.startDate).format('YYYY-MM-DDTHH:mm'),
      endDate: moment(eventData.endDate).format('YYYY-MM-DDTHH:mm'),
      isAllDay: eventData.isAllDay,
      participants: eventData.participants ? eventData.participants.map(p => p._id) : []
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) return;

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
        addNotification({
          title: 'Event Updated',
          message: `"${eventForm.title}" has been updated successfully`,
          type: 'success'
        });
      } else {
        await createCalendarEvent(eventData);
        addNotification({
          title: 'Event Created',
          message: `"${eventForm.title}" has been created successfully`,
          type: 'success'
        });
      }

      refreshCalendarEvents();
      setShowEventModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      addNotification({
        title: 'Error',
        message: `Failed to ${selectedEvent ? 'update' : 'create'} event: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    try {
      await deleteCalendarEvent(selectedEvent._id);
      addNotification({
        title: 'Event Deleted',
        message: `"${selectedEvent.title}" has been deleted successfully`,
        type: 'success'
      });
      refreshCalendarEvents();
      setShowEventModal(false);
      resetForm();
    } catch (error) {
      console.error('Error deleting event:', error);
      addNotification({
        title: 'Error',
        message: `Failed to delete event: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      isAllDay: false,
      participants: []
    });
  };

  const toggleParticipant = (friendId) => {
    setEventForm(prev => ({
      ...prev,
      participants: prev.participants.includes(friendId)
        ? prev.participants.filter(id => id !== friendId)
        : [...prev.participants, friendId]
    }));
  };

  const eventStyleGetter = (event) => {
    const eventData = event.resource;
    let backgroundColor = '#3174ad';
    
    // Different colors based on event creator
    if (eventData.creator && eventData.creator._id) {
      backgroundColor = '#3174ad'; // Default blue for own events
    } else {
      backgroundColor = '#50c878'; // Green for events you're invited to
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const navigateCalendar = (direction) => {
    let newDate;
    if (direction === 'prev') {
      newDate = currentView === 'day' ? moment(currentDate).subtract(1, 'day').toDate() :
                currentView === 'week' ? moment(currentDate).subtract(1, 'week').toDate() :
                moment(currentDate).subtract(1, 'month').toDate();
    } else {
      newDate = currentView === 'day' ? moment(currentDate).add(1, 'day').toDate() :
                currentView === 'week' ? moment(currentDate).add(1, 'week').toDate() :
                moment(currentDate).add(1, 'month').toDate();
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Modern Header with View Controls */}
      <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Title and Date Navigation */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-medium">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-800">Calendar</h1>
              <p className="text-sm text-neutral-600">
                {moment(currentDate).format('MMMM YYYY')}
              </p>
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center space-x-2 ml-6">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Controls and Create Button */}
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-primary-50 rounded-xl p-1">
              {[
                { view: 'day', label: 'Day', icon: CalendarIcon },
                { view: 'week', label: 'Week', icon: Grid },
                { view: 'month', label: 'Month', icon: Grid },
                { view: 'agenda', label: 'List', icon: List }
              ].map(({ view, label, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === view
                      ? 'bg-white text-primary-700 shadow-soft'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-25'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Create Event Button */}
            <button
              onClick={() => {
                resetForm();
                setShowEventModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-large transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Calendar Container */}
      <div className="bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden">
        <div className="p-6" style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEventsFormatted}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            step={60}
            showMultiDayTimes
            className="modern-calendar"
          />
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-large border border-primary-100 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  {selectedEvent ? 'Edit Event' : 'Create Event'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetForm();
                }}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="What's the event about?"
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
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Add event details..."
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={eventForm.isAllDay}
                  onChange={(e) => setEventForm(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-neutral-700">All day event</label>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Start {eventForm.isAllDay ? 'Date' : 'Date & Time'} *
                  </label>
                  <input
                    type={eventForm.isAllDay ? 'date' : 'datetime-local'}
                    value={eventForm.isAllDay ? eventForm.startDate.split('T')[0] : eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    End {eventForm.isAllDay ? 'Date' : 'Date & Time'} *
                  </label>
                  <input
                    type={eventForm.isAllDay ? 'date' : 'datetime-local'}
                    value={eventForm.isAllDay ? eventForm.endDate.split('T')[0] : eventForm.endDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Participants */}
              {friends && friends.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Invite Friends (optional)
                  </label>
                  <div className="bg-neutral-50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                    {friends.map((friend) => {
                      if (!friend) return null;
                      
                      return (
                        <label
                          key={friend._id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={eventForm.participants.includes(friend._id)}
                            onChange={() => toggleParticipant(friend._id)}
                            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                          />
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {friend.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm text-neutral-700 font-medium">{friend.username || 'Unknown'}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-primary-100 bg-neutral-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
              <button
                onClick={handleSaveEvent}
                disabled={isLoading || !eventForm.title.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-large transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{selectedEvent ? 'Update' : 'Create'} Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`max-w-sm w-full shadow-large rounded-2xl overflow-hidden animate-slide-up p-4 ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
                  : 'bg-red-50 border-l-4 border-red-400 text-red-800'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n._id !== notification._id))}
                  className="ml-4 text-current opacity-50 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
