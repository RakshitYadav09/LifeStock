import React, { useState } from 'react';
import { Plus, X, Calendar, CheckSquare, List, Users } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';
import { useNotification } from '../context/NotificationContext';
import {
  createTask,
  createCalendarEvent,
  createSharedList,
  sendFriendRequest,
  searchUsers
} from '../services/api';

const QuickAddModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('task');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    participants: []
  });
  const [loading, setLoading] = useState(false);

  const { friends, refreshSharedTasks, refreshCalendarEvents, refreshSharedLists, refreshFriends } = useCollaboration();
  const { showError, showSuccess } = useNotification();

  const quickAddOptions = [
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'primary' },
    { id: 'event', label: 'Event', icon: Calendar, color: 'secondary' },
    { id: 'list', label: 'List', icon: List, color: 'primary' },
    { id: 'friend', label: 'Friend', icon: Users, color: 'secondary' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'task':
          await createTask({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            sharedWith: formData.participants,
            dueDate: formData.date && formData.time ? 
              new Date(`${formData.date}T${formData.time}`).toISOString() : null
          });
          refreshSharedTasks();
          break;
        
        case 'event':
          const startDate = formData.date && formData.time ? 
            new Date(`${formData.date}T${formData.time}`) : new Date();
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
          
          await createCalendarEvent({
            title: formData.title,
            description: formData.description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            participants: formData.participants
          });
          refreshCalendarEvents();
          break;
          
        case 'list':
          await createSharedList({
            name: formData.title,
            description: formData.description,
            collaborators: formData.participants
          });
          refreshSharedLists();
          break;
          
        case 'friend':
          // First search for the user by username/email
          const searchResponse = await searchUsers(formData.title);
          const users = searchResponse.data;
          
          if (users.length === 0) {
            throw new Error('User not found. Please check the username or email.');
          }
          
          // If multiple users found, use the first exact match or first result
          const targetUser = users.find(user => 
            user.username.toLowerCase() === formData.title.toLowerCase() || 
            user.email.toLowerCase() === formData.title.toLowerCase()
          ) || users[0];
          
          await sendFriendRequest(targetUser._id);
          // Refresh friends list
          if (refreshFriends) {
            await refreshFriends();
          }
          break;
          
        default:
          throw new Error('Invalid tab selected');
      }
      
      resetForm();
      onClose();
    } catch (error) {
      showError(error.response?.data?.message || `Failed to create ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      priority: 'medium',
      participants: []
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large border border-primary-100 w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-display font-semibold text-neutral-800">Quick Add</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-primary-100">
          {quickAddOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveTab(option.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === option.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-25'
                  : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-25'
              }`}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`${activeTab === 'task' ? 'What needs to be done?' : 
                              activeTab === 'event' ? 'Event title' :
                              activeTab === 'list' ? 'List name' : 'Friend username or email'}`}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
              />
            </div>

            {/* Description for tasks and events */}
            {(activeTab === 'task' || activeTab === 'event') && (
              <div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                />
              </div>
            )}

            {/* Date/Time for events */}
            {activeTab === 'event' && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            )}

            {/* Priority for tasks */}
            {activeTab === 'task' && (
              <div>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            )}

            {/* Participants/Sharing for tasks, events, and lists */}
            {(activeTab === 'task' || activeTab === 'event' || activeTab === 'list') && friends.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Share with friends (optional)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {friends.map((friend) => (
                    <label key={friend._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(friend._id)}
                        onChange={(e) => {
                          const participants = e.target.checked
                            ? [...formData.participants, friend._id]
                            : formData.participants.filter(id => id !== friend._id);
                          setFormData({ ...formData, participants });
                        }}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">{friend.username}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-large transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create {activeTab}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
