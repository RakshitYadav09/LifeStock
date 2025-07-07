import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CheckSquare, Calendar, Users, FileText, Clock } from 'lucide-react';
import api from '../services/api';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({
    tasks: [],
    events: [],
    friends: [],
    lists: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchInputRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'lists', label: 'Lists', icon: FileText }
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setResults({ tasks: [], events: [], friends: [], lists: [] });
        return;
      }

      try {
        setLoading(true);
        const searchPromises = [];

        // Search tasks
        if (selectedCategory === 'all' || selectedCategory === 'tasks') {
          searchPromises.push(
            api.get(`/tasks?search=${encodeURIComponent(searchTerm)}`)
              .then(response => ({ type: 'tasks', data: response.data }))
              .catch(() => ({ type: 'tasks', data: [] }))
          );
        }

        // Search events (calendar items)
        if (selectedCategory === 'all' || selectedCategory === 'events') {
          searchPromises.push(
            api.get(`/calendar/events?search=${encodeURIComponent(searchTerm)}`)
              .then(response => ({ type: 'events', data: response.data }))
              .catch(() => ({ type: 'events', data: [] }))
          );
        }

        // Search friends
        if (selectedCategory === 'all' || selectedCategory === 'friends') {
          searchPromises.push(
            api.get(`/friends?search=${encodeURIComponent(searchTerm)}`)
              .then(response => ({ type: 'friends', data: response.data }))
              .catch(() => ({ type: 'friends', data: [] }))
          );
        }

        // Search shared lists
        if (selectedCategory === 'all' || selectedCategory === 'lists') {
          searchPromises.push(
            api.get(`/shared-lists?search=${encodeURIComponent(searchTerm)}`)
              .then(response => ({ type: 'lists', data: response.data }))
              .catch(() => ({ type: 'lists', data: [] }))
          );
        }

        const searchResults = await Promise.all(searchPromises);
        
        const newResults = { tasks: [], events: [], friends: [], lists: [] };
        searchResults.forEach(result => {
          newResults[result.type] = result.data;
        });

        setResults(newResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayedSearch = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory]);

  const handleClose = () => {
    setSearchTerm('');
    setResults({ tasks: [], events: [], friends: [], lists: [] });
    setSelectedCategory('all');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const renderSearchResults = () => {
    const hasResults = Object.values(results).some(arr => arr.length > 0);
    
    if (!searchTerm.trim()) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-neutral-600 mb-2">Start searching</h3>
          <p className="text-neutral-500">Search for tasks, events, friends, and lists</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Searching...</p>
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-neutral-600 mb-2">No results found</h3>
          <p className="text-neutral-500">Try adjusting your search terms</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Tasks */}
        {results.tasks.length > 0 && (
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-3">
              <CheckSquare className="w-4 h-4" />
              <span>Tasks ({results.tasks.length})</span>
            </h3>
            <div className="space-y-2">
              {results.tasks.slice(0, 5).map(task => (
                <div key={task._id} className="p-3 border border-neutral-200 rounded-lg hover:bg-primary-25 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-2 text-xs text-neutral-500">
                        {task.category && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md">
                            {task.category}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-success-500' : 'bg-neutral-300'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {results.events.length > 0 && (
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-3">
              <Calendar className="w-4 h-4" />
              <span>Events ({results.events.length})</span>
            </h3>
            <div className="space-y-2">
              {results.events.slice(0, 5).map(event => (
                <div key={event._id} className="p-3 border border-neutral-200 rounded-lg hover:bg-primary-25 transition-colors cursor-pointer">
                  <h4 className="font-medium text-neutral-800">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center space-x-1 mt-2 text-xs text-neutral-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(event.startTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends */}
        {results.friends.length > 0 && (
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-3">
              <Users className="w-4 h-4" />
              <span>Friends ({results.friends.length})</span>
            </h3>
            <div className="space-y-2">
              {results.friends.slice(0, 5).map(friend => (
                <div key={friend._id} className="p-3 border border-neutral-200 rounded-lg hover:bg-primary-25 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-800">{friend.username}</h4>
                      <p className="text-sm text-neutral-600">{friend.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lists */}
        {results.lists.length > 0 && (
          <div>
            <h3 className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-3">
              <FileText className="w-4 h-4" />
              <span>Lists ({results.lists.length})</span>
            </h3>
            <div className="space-y-2">
              {results.lists.slice(0, 5).map(list => (
                <div key={list._id} className="p-3 border border-neutral-200 rounded-lg hover:bg-primary-25 transition-colors cursor-pointer">
                  <h4 className="font-medium text-neutral-800">{list.name}</h4>
                  {list.description && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{list.description}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2">
                    {list.items?.length || 0} items
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center pt-20 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large border border-primary-100 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center space-x-4 p-6 border-b border-primary-100">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search everything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 p-4 border-b border-primary-100 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderSearchResults()}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
