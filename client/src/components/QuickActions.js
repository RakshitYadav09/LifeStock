import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Calendar, FileText, Users, Rocket } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';

const QuickActions = () => {
  const navigate = useNavigate();
  const { friends, sharedTasks, calendarEvents } = useCollaboration();
  const [activeAction, setActiveAction] = useState(null);

  const quickActions = useMemo(() => [
    {
      id: 'quick-task',
      title: 'Quick Task',
      description: 'Add a task instantly',
      icon: Zap,
      color: 'primary',
      action: () => navigate('/?quick-task=true'),
      shortcut: 'T'
    },
    {
      id: 'quick-event',
      title: 'Schedule Meeting',
      description: 'Create calendar event',
      icon: Calendar,
      color: 'secondary',
      action: () => navigate('/calendar?create=true'),
      shortcut: 'M'
    },
    {
      id: 'quick-list',
      title: 'New List',
      description: 'Start a shared list',
      icon: FileText,
      color: 'primary',
      action: () => navigate('/shared-lists?create=true'),
      shortcut: 'L'
    },
    {
      id: 'find-friends',
      title: 'Find Friends',
      description: 'Connect with others',
      icon: Users,
      color: 'secondary',
      action: () => navigate('/friends?tab=search'),
      shortcut: 'F'
    }
  ], [navigate]);

  const handleActionClick = useCallback((action) => {
    setActiveAction(action.id);
    setTimeout(() => {
      action.action();
      setActiveAction(null);
    }, 200);
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const action = quickActions.find(a => a.shortcut.toLowerCase() === event.key.toLowerCase());
        if (action) {
          event.preventDefault();
          handleActionClick(action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickActions, handleActionClick]);

  const getColorClasses = (color, isActive) => {
    const baseClasses = 'transition-all duration-200';
    
    if (isActive) {
      return color === 'primary' 
        ? `${baseClasses} bg-primary-600 text-white scale-95 shadow-large`
        : `${baseClasses} bg-secondary-600 text-white scale-95 shadow-large`;
    }
    
    return color === 'primary'
      ? `${baseClasses} bg-primary-50 text-primary-700 hover:bg-primary-100 hover:shadow-medium`
      : `${baseClasses} bg-secondary-50 text-secondary-700 hover:bg-secondary-100 hover:shadow-medium`;
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="text-lg font-display font-semibold text-neutral-800">Quick Actions</h3>
        </div>
        <div className="text-xs text-neutral-500 hidden md:block">
          Use Ctrl + key shortcuts
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`group relative p-4 rounded-xl border-2 border-transparent ${getColorClasses(action.color, activeAction === action.id)} animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="group-hover:scale-110 transition-transform duration-200">
                <action.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {action.title}
                </div>
                <div className="text-xs opacity-75">
                  {action.description}
                </div>
              </div>
            </div>
            
            {/* Keyboard shortcut indicator */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-white bg-opacity-20 rounded-md flex items-center justify-center text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {action.shortcut}
            </div>
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-6 pt-4 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary-600">{friends.length}</div>
            <div className="text-xs text-neutral-500">Friends</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary-600">
              {sharedTasks.filter(task => !task.completed).length}
            </div>
            <div className="text-xs text-neutral-500">Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary-600">
              {calendarEvents.filter(event => new Date(event.startDate) >= new Date()).length}
            </div>
            <div className="text-xs text-neutral-500">Upcoming</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
