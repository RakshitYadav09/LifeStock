import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PenTool, ClipboardList, Zap, Wand2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useCollaboration } from '../context/UserCollaborationContext';
import TaskList from '../components/TaskList';
import CreateTask from '../components/CreateTask';
import NotificationCenter from '../components/NotificationCenter';
import SmartSuggestions from '../components/SmartSuggestions';
import QuickActions from '../components/QuickActions';
import UpcomingEvents from '../components/UpcomingEvents';

const DashboardPage = () => {
  const { user, loading } = useContext(AuthContext);
  const { friends, sharedTasks, calendarEvents } = useCollaboration();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-large">
                  <span className="text-white text-2xl font-bold">
                    {(user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-800">
                  {getCurrentGreeting()}, {user?.username || 'User'}! 
                </h1>
                <p className="text-neutral-600 mt-1 flex items-center space-x-4">
                  <span>Ready to make today productive?</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                    {getProductivityScore()}% completed
                  </span>
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{friends.length}</div>
                <div className="text-xs text-neutral-500">Friends</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">
                  {sharedTasks.filter(task => !task.completed).length}
                </div>
                <div className="text-xs text-neutral-500">Active Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {calendarEvents.filter(event => new Date(event.startDate) >= new Date()).length}
                </div>
                <div className="text-xs text-neutral-500">Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Task Creation */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <PenTool className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-xl font-display font-semibold text-neutral-800">Add New Task</h2>
              </div>
              <CreateTask onTaskAdded={handleTaskAdded} />
            </div>

            {/* Recent Tasks */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-display font-semibold text-neutral-800">Your Tasks</h2>
                </div>
                <button onClick={() => navigate('/shared-tasks')} className="btn-ghost text-sm">
                  View All Tasks →
                </button>
              </div>
              <TaskList refreshTrigger={refreshTrigger} limit={5} />
            </div>
          </div>

          {/* Right Column - Insights & Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Smart Suggestions */}
            <SmartSuggestions />

            {/* Upcoming Events */}
            <UpcomingEvents />

            {/* Recent Activity */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-secondary-600" />
                </div>
                <h3 className="text-lg font-display font-semibold text-neutral-800">Collaboration</h3>
              </div>
              
              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.slice(0, 3).map((friend) => {
                    if (!friend || !friend.username) return null;

                    return (
                      <div key={friend._id} className="flex items-center space-x-3 p-3 bg-primary-25 rounded-xl hover:bg-primary-50 transition-colors cursor-pointer" onClick={() => navigate('/friends')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-medium">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            {friend.username}
                          </p>
                          <p className="text-xs text-neutral-600">
                            Connected since {new Date(friend.friendsSince).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-primary-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                  
                  {friends.length > 3 && (
                    <button 
                      onClick={() => navigate('/friends')}
                      className="w-full p-3 text-sm text-neutral-600 hover:text-primary-600 transition-colors border border-dashed border-neutral-200 rounded-xl hover:border-primary-200"
                    >
                      View {friends.length - 3} more friends
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-4xl mb-3 block">🤝</span>
                  <p className="text-neutral-600 mb-3">Start collaborating!</p>
                  <button
                    onClick={() => navigate('/friends')}
                    className="btn-primary text-sm"
                  >
                    Find Friends
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default DashboardPage;
