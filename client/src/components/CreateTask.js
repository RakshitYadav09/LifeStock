import React, { useState } from 'react';
import { PlusCircle, X, Tag, Calendar, Users } from 'lucide-react';
import { useCollaboration } from '../context/UserCollaborationContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const CreateTask = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sharedWith, setSharedWith] = useState([]);
  const [loading, setLoading] = useState(false);
  const { friends } = useCollaboration();
  const { showWarning, showError } = useNotification();

  const predefinedCategories = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Home'];
  const predefinedTags = ['urgent', 'important', 'quick', 'meeting', 'research', 'creative', 'admin'];

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setCurrentTag('');
    setCategory('');
    setDueDate('');
    setPriority('medium');
    setSharedWith([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showWarning('Please enter a task title');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        tags: tags,
        category: category,
        dueDate: dueDate || null,
        priority: priority,
        sharedWith: sharedWith
      });
      
      // Clear form
      clearForm();
      
      // Notify parent component
      if (onTaskAdded) {
        onTaskAdded(response.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-primary-100 p-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <PlusCircle className="w-4 h-4 text-primary-600" />
        </div>
        <h2 className="text-lg font-display font-semibold text-neutral-800">Create New Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags
          </label>
          <div className="space-y-3">
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Tag Input */}
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add tags (press Enter or comma to add)"
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            
            {/* Predefined Tags */}
            <div className="flex flex-wrap gap-2">
              {predefinedTags.filter(tag => !tags.includes(tag)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
              <option value="">Select category</option>
              {predefinedCategories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Due Date
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>

        {/* Sharing Section */}
        {friends.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Share Task With Friends
            </label>
            <div className="bg-neutral-50 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto">
              {friends.map((friend) => (
                <label key={friend._id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={sharedWith.includes(friend._id)}
                    onChange={(e) => {
                      const newSharedWith = e.target.checked
                        ? [...sharedWith, friend._id]
                        : sharedWith.filter(id => id !== friend._id);
                      setSharedWith(newSharedWith);
                    }}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{friend.username}</span>
                </label>
              ))}
            </div>
            {sharedWith.length > 0 && (
              <p className="text-xs text-neutral-500 mt-2">
                Task will be shared with {sharedWith.length} friend{sharedWith.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={clearForm}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-large transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Create Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
