import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  UserPlus, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Target, 
  TrendingUp 
} from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';

const SmartSuggestions = () => {
  const { friends, sharedTasks, calendarEvents, sharedLists } = useCollaboration();
  const [suggestions, setSuggestions] = useState([]);

  const getIconComponent = (iconName) => {
    const iconMap = {
      'file-text': FileText,
      'clock': Clock,
      'user-plus': UserPlus,
      'calendar': CalendarIcon,
      'sparkles': Sparkles,
      'target': Target,
      'trending-up': TrendingUp
    };
    return iconMap[iconName] || FileText;
  };

  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions = [];

      // Suggest creating lists based on incomplete tasks
      const incompleteTasks = sharedTasks.filter(task => !task.completed);
      if (incompleteTasks.length > 3) {
        newSuggestions.push({
          id: 'create-list',
          type: 'productivity',
          title: 'Organize Your Tasks',
          description: `You have ${incompleteTasks.length} pending tasks. Consider creating a shared list to better organize them.`,
          action: { type: 'navigate', path: '/shared-lists', text: 'Create List' },
          priority: 'medium',
          icon: 'file-text'
        });
      }

      // Suggest scheduling calendar events for overdue tasks
      const overdueTasks = sharedTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
      );
      if (overdueTasks.length > 0) {
        newSuggestions.push({
          id: 'schedule-tasks',
          type: 'time-management',
          title: 'Schedule Overdue Tasks',
          description: `You have ${overdueTasks.length} overdue tasks. Schedule time to complete them.`,
          action: { type: 'navigate', path: '/calendar', text: 'Schedule Time' },
          priority: 'high',
          icon: 'clock'
        });
      }

      // Suggest connecting with more friends if user has few
      if (friends.length < 3) {
        newSuggestions.push({
          id: 'add-friends',
          type: 'collaboration',
          title: 'Expand Your Network',
          description: 'Add more friends to unlock powerful collaboration features.',
          action: { type: 'navigate', path: '/friends', text: 'Find Friends' },
          priority: 'low',
          icon: 'user-plus'
        });
      }

      // Suggest weekly review if no recent activity
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentEvents = calendarEvents.filter(event => 
        new Date(event.startDate) >= weekAgo
      );
      
      if (recentEvents.length === 0 && calendarEvents.length > 0) {
        newSuggestions.push({
          id: 'weekly-review',
          type: 'reflection',
          title: 'Plan Your Week',
          description: 'Schedule a weekly review to plan upcoming tasks and events.',
          action: { type: 'navigate', path: '/calendar', text: 'Schedule Review' },
          priority: 'medium',
          icon: 'calendar'
        });
      }

      setSuggestions(newSuggestions.slice(0, 3)); // Limit to 3 suggestions
    };

    generateSuggestions();
  }, [friends, sharedTasks, calendarEvents, sharedLists]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-800';
      case 'medium': return 'text-yellow-800';
      case 'low': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="card animate-fade-in">      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="text-lg font-display font-semibold text-neutral-800">Smart Suggestions</h3>
      </div>
        <div className="text-center py-6">
          <Target className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-600">You're doing great! Keep up the momentum.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="text-lg font-display font-semibold text-neutral-800">Smart Suggestions</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id} 
            className={`p-4 rounded-xl border-2 ${getPriorityColor(suggestion.priority)} animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start space-x-3">
              {(() => {
                const IconComponent = getIconComponent(suggestion.icon);
                return <IconComponent className="w-6 h-6 text-primary-600 mt-0.5" />;
              })()}
              <div className="flex-1">
                <h4 className={`font-semibold ${getPriorityTextColor(suggestion.priority)} mb-1`}>
                  {suggestion.title}
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  {suggestion.description}
                </p>
                <button 
                  className="btn-secondary text-xs"
                  onClick={() => window.location.href = suggestion.action.path}
                >
                  {suggestion.action.text}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;
