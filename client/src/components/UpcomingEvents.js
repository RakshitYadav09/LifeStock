import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CalendarDays, 
  Utensils, 
  Dumbbell, 
  PartyPopper, 
  Plane, 
  MapPin, 
  Users 
} from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const { calendarEvents } = useCollaboration();

  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = calendarEvents
    .filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 4); // Show only next 4 events

  const formatEventTime = (startDate, endDate, isAllDay) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isAllDay) {
      return 'All day';
    }
    
    const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${startTime} - ${endTime}`;
  };

  const formatEventDate = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getEventTypeIcon = (event) => {
    const title = event.title.toLowerCase();
    if (title.includes('meeting') || title.includes('call')) return Calendar;
    if (title.includes('lunch') || title.includes('dinner')) return Utensils;
    if (title.includes('workout') || title.includes('gym')) return Dumbbell;
    if (title.includes('birthday') || title.includes('party')) return PartyPopper;
    if (title.includes('travel') || title.includes('trip')) return Plane;
    return Calendar;
  };

  const getTimeUntilEvent = (startDate) => {
    const now = new Date();
    const event = new Date(startDate);
    const diffMs = event.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Starting soon';
    if (diffHours < 24) return `In ${diffHours}h`;
    
    const diffDays = Math.ceil(diffHours / 24);
    return `In ${diffDays}d`;
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="card animate-fade-in">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="text-lg font-display font-semibold text-neutral-800">Upcoming Events</h3>
        </div>
        <div className="text-center py-6">
          <CalendarDays className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-600 mb-3">No events in the next 7 days</p>
          <button
            onClick={() => navigate('/calendar')}
            className="btn-secondary text-sm"
          >
            Schedule Something
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="text-lg font-display font-semibold text-neutral-800">Upcoming Events</h3>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((event, index) => (
          <div 
            key={event._id} 
            className="group p-3 rounded-xl bg-neutral-25 hover:bg-primary-25 transition-all duration-200 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate('/calendar')}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {(() => {
                  const IconComponent = getEventTypeIcon(event);
                  return <IconComponent className="w-5 h-5 text-primary-600 mt-0.5" />;
                })()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-800 truncate group-hover:text-primary-700 transition-colors">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-neutral-600 truncate mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-3 text-right flex-shrink-0">
                    <div className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                      {getTimeUntilEvent(event.startDate)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-neutral-500 space-x-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{formatEventDate(event.startDate)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatEventTime(event.startDate, event.endDate, event.isAllDay)}</span>
                  </span>
                  {event.participants && event.participants.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{event.participants.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {calendarEvents.length > upcomingEvents.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/calendar')}
            className="text-neutral-500 hover:text-primary-600 text-sm transition-colors"
          >
            View {calendarEvents.length - upcomingEvents.length} more events →
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
