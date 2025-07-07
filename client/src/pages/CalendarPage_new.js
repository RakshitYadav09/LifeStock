import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Calendar as CalendarIcon, Plus, X, Trash2, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';
import api from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Create the localizer with moment
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  
  const { friends } = useCollaboration();
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    participants: []
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calendar/events');
      const formattedEvents = response.data.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        resource: event,
        description: event.description,
        participants: event.participants
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification('Failed to fetch events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSelectSlot = ({ start, end }) => {
    const startMoment = moment(start);
    const endMoment = moment(end);
    
    setEventForm({
      title: '',
      description: '',
      startDate: startMoment.format('YYYY-MM-DD'),
      startTime: startMoment.format('HH:mm'),
      endDate: endMoment.format('YYYY-MM-DD'),
      endTime: endMoment.format('HH:mm'),
      participants: []
    });
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleSelectEvent = (event) => {
    const eventData = event.resource;
    const startMoment = moment(event.start);
    const endMoment = moment(event.end);
    
    setSelectedEvent(eventData);
    setEventForm({
      title: eventData.title || '',
      description: eventData.description || '',
      startDate: startMoment.format('YYYY-MM-DD'),
      startTime: startMoment.format('HH:mm'),
      endDate: endMoment.format('YYYY-MM-DD'),
      endTime: endMoment.format('HH:mm'),
      participants: eventData.participants ? eventData.participants.map(p => p._id || p) : []
    });
    setShowEventModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const startDateTime = moment(`${eventForm.startDate} ${eventForm.startTime}`).toISOString();
      const endDateTime = moment(`${eventForm.endDate} ${eventForm.endTime}`).toISOString();

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDateTime,
        endDate: endDateTime,
        participants: eventForm.participants
      };

      if (selectedEvent) {
        await api.put(`/calendar/events/${selectedEvent._id}`, eventData);
        showNotification('Event updated successfully!');
      } else {
        await api.post('/calendar/events', eventData);
        showNotification('Event created successfully!');
      }

      setShowEventModal(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification('Failed to save event', 'error');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/calendar/events/${selectedEvent._id}`);
      showNotification('Event deleted successfully!');
      setShowEventModal(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event', 'error');
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      participants: []
    });
    setSelectedEvent(null);
  };

  const handleParticipantToggle = (friendId) => {
    setEventForm(prev => ({
      ...prev,
      participants: prev.participants.includes(friendId)
        ? prev.participants.filter(id => id !== friendId)
        : [...prev.participants, friendId]
    }));
  };

  const navigateDate = (direction) => {
    const newDate = moment(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.add(direction, 'day');
        break;
      case 'week':
        newDate.add(direction, 'week');
        break;
      case 'month':
        newDate.add(direction, 'month');
        break;
      default:
        newDate.add(direction, 'month');
    }
    
    setCurrentDate(newDate.toDate());
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-neutral-600 font-medium">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-large">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-800">Calendar</h1>
                <p className="text-neutral-600 mt-1">{moment(currentDate).format('MMMM YYYY')}</p>
              </div>
            </div>

            {/* Navigation and Controls */}
            <div className="flex items-center space-x-4">
              {/* Date Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateDate(1)}
                  className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* View Controls */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                {['month', 'week', 'day'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                      currentView === view
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-600 hover:text-primary-600'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>

              {/* Create Event Button */}
              <button
                onClick={() => {
                  const now = moment();
                  setEventForm({
                    title: '',
                    description: '',
                    startDate: now.format('YYYY-MM-DD'),
                    startTime: now.format('HH:mm'),
                    endDate: now.format('YYYY-MM-DD'),
                    endTime: now.add(1, 'hour').format('HH:mm'),
                    participants: []
                  });
                  setSelectedEvent(null);
                  setShowEventModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border animate-fade-in ${
            notification.type === 'error' 
              ? 'bg-error-50 border-error-200 text-error-800' 
              : 'bg-success-50 border-success-200 text-success-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden animate-slide-up">
          <div className="p-6">
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onView={setCurrentView}
                onNavigate={setCurrentDate}
                view={currentView}
                date={currentDate}
                selectable
                popup
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                step={30}
                showMultiDayTimes
                components={{
                  toolbar: () => null, // We have our own toolbar
                }}
              />
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-neutral-800">
                  {selectedEvent ? 'Edit Event' : 'Create Event'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="Enter event description"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Participants */}
                {friends && friends.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      <Users className="w-4 h-4 inline mr-1" />
                      Invite Participants
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-2 border border-neutral-200 rounded-xl p-3">
                      {friends.map((friend) => (
                        <label key={friend._id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eventForm.participants.includes(friend._id)}
                            onChange={() => handleParticipantToggle(friend._id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          />
                          <span className="text-sm text-neutral-700">{friend.username}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    {selectedEvent && (
                      <button
                        type="button"
                        onClick={handleDeleteEvent}
                        className="flex items-center space-x-2 px-4 py-2 bg-error-600 text-white rounded-xl hover:bg-error-700 transition-all duration-200 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium shadow-medium"
                    >
                      {selectedEvent ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
