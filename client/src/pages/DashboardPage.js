import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useCollaboration } from '../context/UserCollaborationContext';
import TaskList from '../components/TaskList';
import CreateTask from '../components/CreateTask';
import SmartSuggestions from '../components/SmartSuggestions';
import QuickActions from '../components/QuickActions';
import UpcomingEvents from '../components/UpcomingEvents';

const DashboardPage = () => {
  const { user, loading } = useContext(AuthContext);
  const { friends, sharedTasks, calendarEvents } = useCollaboration();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const createTaskRef = useRef(null);

  // Handle auto-scroll to create task section
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('quick-task') === 'true' && createTaskRef.current) {
      // Small delay to ensure component is rendered
      setTimeout(() => {
        createTaskRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Remove the query parameter
        navigate('/', { replace: true });
      }, 300);
    }
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleTaskAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getProductivityScore = () => {
    if (sharedTasks.length === 0) return 0;
    const completedTasks = sharedTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / sharedTasks.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Welcome Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    {(user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-success-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 truncate">
                  {getCurrentGreeting()}, {user?.username || 'User'}! 
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                  <span className="text-sm sm:text-base text-neutral-600">Ready to make today productive?</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 w-fit">
                    {getProductivityScore()}% completed
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats - Mobile Friendly */}
            <div className="grid grid-cols-3 gap-3 sm:flex sm:space-x-4">
              <div className="bg-white rounded-xl p-4 text-center border border-neutral-100">
                <div className="text-lg sm:text-2xl font-bold text-primary-600">{friends.length}</div>
                <div className="text-xs text-neutral-500">Friends</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-neutral-100">
                <div className="text-lg sm:text-2xl font-bold text-warning-600">
                  {sharedTasks.filter(task => !task.completed).length}
                </div>
                <div className="text-xs text-neutral-500">Active</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-neutral-100">
                <div className="text-lg sm:text-2xl font-bold text-success-600">
                  {calendarEvents.filter(event => new Date(event.startDate) >= new Date()).length}
                </div>
                <div className="text-xs text-neutral-500">Events</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column (Main) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <QuickActions />
            {/* Smart Suggestions */}
            <SmartSuggestions onApplySuggestion={(suggestion) => { console.log('Applying suggestion:', suggestion); }} />

            {/* Task List */}
            <TaskList key={refreshTrigger} />
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6 sm:space-y-8">
            {/* Create Task Form */}
            <div ref={createTaskRef} className="scroll-mt-20">
              <CreateTask onTaskAdded={handleTaskAdded} />
            </div>

            {/* Upcoming Events */}
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
