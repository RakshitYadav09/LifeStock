import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TestCalendar = () => {
  const events = [
    {
      id: 1,
      title: 'Test Event',
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    }
  ];

  return (
    <div style={{ height: '500px', padding: '20px' }}>
      <h1>Test Calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
      />
    </div>
  );
};

export default TestCalendar;
