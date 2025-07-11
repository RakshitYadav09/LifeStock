import React, { useState, useEffect } from 'react';
import { Trash2, Check, Tag, Calendar, AlertCircle, Filter } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const TaskList = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { showError, showSuccess } = useNotification();

  // Get unique categories and tags from tasks
  const categories = [...new Set(tasks.filter(task => task.category).map(task => task.category))];
  const allTags = [...new Set(tasks.flatMap(task => task.tags || []))];

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    const matchesTag = !selectedTag || (task.tags && task.tags.includes(selectedTag));
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesTag && matchesSearch;
  });

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { completed: !completed });
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Use a simple confirmation modal instead of browser confirm
    const taskToDelete = tasks.find(task => task._id === taskId);
    if (taskToDelete) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(task => task._id !== taskId));
        showSuccess('Task deleted successfully');
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  // Remove all edit-related functions since sharing functionality doesn't work
  // Keeping only the delete functionality

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-8 animate-fade-in">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-neutral-600 font-medium">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-display font-semibold text-neutral-800 mb-2">No tasks yet</h3>
        <p className="text-neutral-600">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-600" />
          </div>
          <h2 className="text-lg font-display font-semibold text-neutral-800">
            Your Tasks ({filteredTasks.length})
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-neutral-50 rounded-xl">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className={`border border-neutral-200 rounded-xl p-4 transition-all duration-200 hover:shadow-medium ${
              task.completed ? 'bg-success-50 border-success-200' : 'bg-white hover:border-primary-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task._id, task.completed)}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-all duration-200"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                      {task.title}
                    </h3>
                    {task.priority && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high' ? 'bg-error-100 text-error-700' :
                        task.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className={`mb-3 text-sm ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>
                      {task.description}
                    </p>
                  )}

                  {/* Tags and Category */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {task.category && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                        <Filter className="w-3 h-3" />
                        <span>{task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                      </span>
                    )}
                    {task.tags && task.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Shared indicator */}
                  {task.isShared && task.sharedWith && task.sharedWith.length > 0 && (
                    <div className="mb-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-secondary-100 text-secondary-700 rounded-md text-xs font-medium">
                        <span>Shared with {task.sharedWith.length} friend{task.sharedWith.length > 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-neutral-500">
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    {task.user && (
                      <span className="flex items-center space-x-1">
                        <span>By: {task.user.username || task.user.email}</span>
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    {new Date(task.dueDate) < new Date() && !task.completed && (
                      <span className="flex items-center space-x-1 text-error-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 text-neutral-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-200"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && tasks.length > 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {/* <Search className="w-8 h-8 text-neutral-400" /> */}
          </div>
          <h3 className="text-lg font-display font-semibold text-neutral-800 mb-2">No matching tasks</h3>
          <p className="text-neutral-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
