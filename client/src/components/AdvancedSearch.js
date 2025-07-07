import React, { useState, useEffect } from 'react';

const AdvancedSearch = ({ items, onResults, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    assignee: 'all',
    hasNotes: false,
    hasDueDate: false,
    overdue: false
  });

  useEffect(() => {
    const filteredItems = items.filter(item => {
      // Text search
      const matchesText = searchTerm === '' || 
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Priority filter
      const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;

      // Status filter
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'completed' && item.completed) ||
        (filters.status === 'pending' && !item.completed);

      // Assignee filter
      const matchesAssignee = filters.assignee === 'all' ||
        (filters.assignee === 'unassigned' && !item.assignedTo) ||
        (item.assignedTo && item.assignedTo._id === filters.assignee);

      // Notes filter
      const matchesNotes = !filters.hasNotes || (item.notes && item.notes.trim() !== '');

      // Due date filter
      const matchesDueDate = !filters.hasDueDate || item.dueDate;

      // Overdue filter
      const matchesOverdue = !filters.overdue || 
        (item.dueDate && new Date(item.dueDate) < new Date() && !item.completed);

      return matchesText && matchesPriority && matchesStatus && 
             matchesAssignee && matchesNotes && matchesDueDate && matchesOverdue;
    });

    onResults(filteredItems);
  }, [searchTerm, filters, items, onResults]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      priority: 'all',
      status: 'all',
      assignee: 'all',
      hasNotes: false,
      hasDueDate: false,
      overdue: false
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Search</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search in item text and notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters(prev => ({...prev, assignee: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {/* Note: In actual usage, you'd pass collaborators as props and map them here */}
          </select>
        </div>
      </div>

      {/* Toggle Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.hasNotes}
            onChange={(e) => setFilters(prev => ({...prev, hasNotes: e.target.checked}))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Has notes</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.hasDueDate}
            onChange={(e) => setFilters(prev => ({...prev, hasDueDate: e.target.checked}))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Has due date</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.overdue}
            onChange={(e) => setFilters(prev => ({...prev, overdue: e.target.checked}))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-red-700">Overdue items</span>
        </label>
      </div>

      <button
        onClick={clearFilters}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default AdvancedSearch;
