import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../context/UserCollaborationContext';
import { shareTask, unshareTask, updateTask, getTasks } from '../services/api';

const SharedTasksPage = () => {
  const { sharedTasks, friends, refreshSharedTasks } = useCollaboration();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMyTasksModal, setShowMyTasksModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending
  const [filterOwner, setFilterOwner] = useState('all'); // all, mine, shared_with_me
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshSharedTasks();
  }, [refreshSharedTasks]);

  const handleTaskComplete = async (taskId, completed) => {
    try {
      await updateTask(taskId, { completed });
      refreshSharedTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleShareTask = async () => {
    if (!selectedTask || selectedFriends.length === 0) return;
    
    setIsLoading(true);
    try {
      await shareTask(selectedTask._id, selectedFriends);
      refreshSharedTasks();
      setShowShareModal(false);
      setSelectedTask(null);
      setSelectedFriends([]);
    } catch (error) {
      console.error('Error sharing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshareTask = async (taskId, userIds) => {
    try {
      await unshareTask(taskId, userIds);
      refreshSharedTasks();
    } catch (error) {
      console.error('Error unsharing task:', error);
    }
  };

  const openShareModal = (task) => {
    setSelectedTask(task);
    setSelectedFriends([]);
    setShowShareModal(true);
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTasks = sharedTasks.filter(task => {
    // Status filter
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterStatus === 'pending' && task.completed) return false;
    
    // Owner filter
    if (filterOwner === 'mine' && !task.isOwner) return false;
    if (filterOwner === 'shared_with_me' && task.isOwner) return false;
    
    return true;
  });

  const loadMyTasks = async () => {
    try {
      const response = await getTasks();
      setMyTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const openMyTasksModal = () => {
    loadMyTasks();
    setShowMyTasksModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Shared Tasks</h1>
        <div className="flex space-x-3">
          <button
            onClick={openMyTasksModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Share My Tasks
          </button>
          <button
            onClick={refreshSharedTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Owner:</label>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="mine">My Tasks</option>
              <option value="shared_with_me">Shared with Me</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredTasks.length} of {sharedTasks.length} tasks
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {sharedTasks.length === 0 ? 'No shared tasks' : 'No tasks match your filters'}
          </h3>
          <p className="text-gray-500">
            {sharedTasks.length === 0 
              ? 'Tasks shared with you by friends will appear here.' 
              : 'Try adjusting your filters to see more tasks.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <div key={task._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.completed && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                          Completed
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className={`text-gray-600 mb-3 ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created by: {task.user.username}</span>
                      <span>Due: {formatDate(task.dueDate)}</span>
                      <span>Created: {formatDate(task.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTaskComplete(task._id, !task.completed)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        task.completed
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => openShareModal(task)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Share
                    </button>
                  </div>
                </div>

                {/* Shared With List */}
                {task.sharedWith && task.sharedWith.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Shared with:</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.sharedWith.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{user.username}</span>
                          <button
                            onClick={() => handleUnshareTask(task._id, [user._id])}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove access"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Task Modal */}
      {showShareModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Share "{selectedTask.title}"
            </h3>
            
            {friends.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No friends to share with. Add friends first!
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                {friends.map((friend) => {
                  if (!friend) return null;
                  
                  return (
                    <label
                      key={friend._id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend._id)}
                        onChange={() => toggleFriendSelection(friend._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {friend.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{friend.username || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{friend.email || ''}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleShareTask}
                disabled={isLoading || selectedFriends.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Sharing...' : 'Share Task'}
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedTask(null);
                  setSelectedFriends([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share My Tasks Modal */}
      {showMyTasksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share My Tasks</h3>
            
            {myTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                You don't have any tasks to share yet.
              </p>
            ) : (
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {myTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500">
                        Due: {formatDate(task.dueDate)} • Priority: {task.priority}
                      </div>
                    </div>
                    <button
                      onClick={() => openShareModal(task)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Share
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowMyTasksModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedTasksPage;
