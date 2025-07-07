import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';

// Create the localizer - this MUST be outside the component to avoid recreation
const localizer = momentLocalizer(moment);

const SimpleCalendar = () => {
  const { calendarEvents } = useCollaboration();
  const [events, setEvents] = useState([]);

  // Transform calendar events for react-big-calendar format
  useEffect(() => {
    if (calendarEvents && calendarEvents.length > 0) {
      const formattedEvents = calendarEvents.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        allDay: event.isAllDay || false,
        resource: event
      }));
      setEvents(formattedEvents);
    } else {
      setEvents([]);
    }
  }, [calendarEvents]);

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt('Enter event title:');
    if (title) {
      const newEvent = {
        id: Date.now(),
        title,
        start,
        end,
        allDay: false
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleSelectEvent = (event) => {
    const action = window.confirm(`Edit "${event.title}"?`);
    if (action) {
      const newTitle = prompt('New title:', event.title);
      if (newTitle) {
        setEvents(prev => 
          prev.map(e => 
            e.id === event.id 
              ? { ...e, title: newTitle }
              : e
          )
        );
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="p-6" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable={true}
            popup={true}
            views={['month', 'week', 'day', 'agenda']}
            style={{ height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;
