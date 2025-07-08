import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Trash2, 
  Tag, 
  Calendar, 
  AlertCircle, 
  Filter, 
  CheckSquare
} from 'lucide-react';
import api from '../services/api';

const AllTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, personal, shared

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

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
    
    // Filter by task type
    const matchesType = filterType === 'all' || 
      (filterType === 'personal' && (!task.isShared || task.sharedWith?.length === 0)) ||
      (filterType === 'shared' && task.isShared && task.sharedWith?.length > 0);
    
    return matchesCategory && matchesTag && matchesSearch && matchesType;
  });

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { completed: !completed });
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  // Remove all edit-related functions since sharing functionality doesn't work
  // Keeping only the delete functionality

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-25 to-primary-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-8 animate-fade-in">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-neutral-600 font-medium">Loading tasks...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-primary-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">All Tasks</h1>
          </div>
          <p className="text-neutral-600">
            Manage all your tasks in one place. Total: {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-6 animate-fade-in">
          {/* Filters */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="LifeStock..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none"
                >
                  <option value="all">All Tasks</option>
                  <option value="personal">Personal</option>
                  <option value="shared">Shared</option>
                </select>
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
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-neutral-800 mb-2">
                  {tasks.length === 0 ? 'No tasks found' : 'No matching tasks'}
                </h3>
                <p className="text-neutral-600">
                  {tasks.length === 0 
                    ? 'Create your first task to get started!' 
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
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
                          <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {/* Task Type Indicator */}
                            {task.isShared && task.sharedWith?.length > 0 && (
                              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                                Shared
                              </span>
                            )}
                            {/* Priority */}
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

                        {/* Shared with information */}
                        {task.isShared && task.sharedWith && task.sharedWith.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-neutral-500">
                              Shared with: {task.sharedWith.map(user => user.username || user).join(', ')}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-xs text-neutral-500">
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                          {task.dueDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </span>
                          )}
                          {task.dueDate && new Date(task.dueDate) < new Date() && !task.completed && (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTasksPage;
