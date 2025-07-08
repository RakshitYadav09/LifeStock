import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollaboration } from '../context/UserCollaborationContext';
import { useNotification } from '../context/NotificationContext';
import {
  getSharedList,
  addListItem,
  updateListItem,
  deleteListItem,
  addListCollaborator,
  removeListCollaborator
} from '../services/api';
import BulkActions from '../components/BulkActions';

const SharedListDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { friends } = useCollaboration();
  const { showError, showSuccess } = useNotification();
  
  const [list, setList] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemAssignedTo, setNewItemAssignedTo] = useState('');
  const [newItemPriority, setNewItemPriority] = useState('medium');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortBy, setSortBy] = useState('addedAt');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadList = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSharedList(id);
      setList(response.data);
    } catch (error) {
      console.error('Error loading list:', error);
      setError('Failed to load list');
      if (error.response?.status === 404) {
        navigate('/shared-lists');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    try {
      const itemData = {
        text: newItemText,
        dueDate: newItemDueDate || undefined,
        quantity: newItemQuantity || undefined,
        assignedTo: newItemAssignedTo || undefined,
        priority: newItemPriority,
        notes: newItemNotes || undefined
      };
      
      const response = await addListItem(id, itemData);
      setList(response.data.sharedList);
      setNewItemText('');
      setNewItemDueDate('');
      setNewItemQuantity('');
      setNewItemAssignedTo('');
      setNewItemPriority('medium');
      setNewItemNotes('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleToggleItem = async (itemId, completed) => {
    try {
      const response = await updateListItem(id, itemId, { completed });
      setList(response.data.sharedList);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    // Remove confirmation dialog and use toast notification
    try {
      const response = await deleteListItem(id, itemId);
      setList(response.data.sharedList);
      showSuccess('Item deleted successfully');
    } catch (error) {
      showError('Failed to delete item');
    }
  };

  const handleAddCollaborator = async (friendId) => {
    try {
      const response = await addListCollaborator(id, friendId);
      setList(response.data.sharedList);
      setShowAddCollaborator(false);
    } catch (error) {
      console.error('Error adding collaborator:', error);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    // Remove confirmation dialog and use toast notification
    try {
      const response = await removeListCollaborator(id, collaboratorId);
      setList(response.data.sharedList);
      showSuccess('Collaborator removed successfully');
    } catch (error) {
      showError('Failed to remove collaborator');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getAvailableFriends = () => {
    if (!list || !friends) return [];
    const collaboratorIds = list.collaborators.map(c => c._id);
    return friends.filter(friend => !collaboratorIds.includes(friend._id));
  };

  const getAllCollaborators = () => {
    if (!list) return [];
    return [list.creator, ...list.collaborators];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterAndSortItems = (items) => {
    let filteredItems = items;

    // Filter by priority
    if (filterPriority !== 'all') {
      filteredItems = filteredItems.filter(item => item.priority === filterPriority);
    }

    // Filter by assignee
    if (filterAssignee !== 'all') {
      filteredItems = filteredItems.filter(item => 
        filterAssignee === 'unassigned' ? !item.assignedTo : item.assignedTo?._id === filterAssignee
      );
    }

    // Sort items
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'addedAt':
        default:
          return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });

    return filteredItems;
  };

  const handleEditItem = async (itemId, updates) => {
    try {
      const response = await updateListItem(id, itemId, updates);
      setList(response.data.sharedList);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleBulkComplete = async () => {
    try {
      const promises = selectedItems.map(itemId => 
        updateListItem(id, itemId, { completed: true })
      );
      await Promise.all(promises);
      await loadList();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error completing items:', error);
    }
  };

  const handleBulkDelete = async () => {
    // Remove confirmation dialog and use toast notification
    try {
      const promises = selectedItems.map(itemId => deleteListItem(id, itemId));
      await Promise.all(promises);
      await loadList();
      setSelectedItems([]);
      showSuccess(`${selectedItems.length} items deleted successfully`);
    } catch (error) {
      showError('Failed to delete items');
    }
  };

  const handleBulkAssign = async (assigneeId) => {
    try {
      const promises = selectedItems.map(itemId => 
        updateListItem(id, itemId, { assignedTo: assigneeId })
      );
      await Promise.all(promises);
      await loadList();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error assigning items:', error);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || 'List not found'}</p>
          <button
            onClick={() => navigate('/shared-lists')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Lists
          </button>
        </div>
      </div>
    );
  }

  const completedItems = filterAndSortItems(list.items.filter(item => item.completed));
  const pendingItems = filterAndSortItems(list.items.filter(item => !item.completed));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-primary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/shared-lists')}
            className="text-primary-600 hover:text-primary-700 mb-3 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Lists</span>
          </button>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-500 p-3 rounded-xl shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">{list.name}</h1>
                {list.description && (
                  <p className="text-neutral-600 mt-1">{list.description}</p>
                )}
              </div>
            </div>
            <div className="text-left lg:text-right">
              <div className="text-sm text-neutral-500">Created by {list.creator.username}</div>
              <div className="text-sm text-neutral-500">{formatDate(list.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary-600">{list.items.length}</div>
            <div className="text-xs sm:text-sm text-neutral-500">Total Items</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-success-600">{completedItems.length}</div>
            <div className="text-xs sm:text-sm text-neutral-500">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-warning-600">{pendingItems.length}</div>
            <div className="text-xs sm:text-sm text-neutral-500">Pending</div>
          </div>
        </div>

        {/* Collaborators */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <h2 className="text-lg font-semibold text-neutral-800">Collaborators</h2>
            <button
              onClick={() => setShowAddCollaborator(true)}
              className="bg-primary-500 text-white px-4 py-2 text-sm rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add Collaborator
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Creator */}
            <div className="flex items-center space-x-3 bg-primary-50 border border-primary-200 rounded-xl px-3 py-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {list.creator.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-900">{list.creator.username}</div>
                <div className="text-xs text-primary-600">Creator</div>
              </div>
            </div>

            {/* Collaborators */}
            {list.collaborators.map((collaborator) => (
              <div key={collaborator._id} className="flex items-center space-x-3 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-success-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {collaborator.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">{collaborator.username}</div>
                  <div className="text-xs text-neutral-500">Collaborator</div>
                </div>
                <button
                  onClick={() => handleRemoveCollaborator(collaborator._id)}
                  className="text-neutral-400 hover:text-error-500 transition-colors p-1"
                  title="Remove collaborator"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Item */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Add New Item</h2>
          <div className="grid grid-cols-1 gap-4 mb-4">
            {/* Item Text */}
            <div className="col-span-1">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Enter item text..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            
            {/* Additional Fields - Mobile Collapsible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Quantity */}
              <div>
                <input
                  type="text"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Quantity (optional)"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              
              {/* Due Date */}
              <div>
                <input
                  type="date"
                  value={newItemDueDate}
                  onChange={(e) => setNewItemDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  title="Due date (optional)"
                />
              </div>
              
              {/* Assigned To */}
              <div>
                <select
                  value={newItemAssignedTo}
                  onChange={(e) => setNewItemAssignedTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">Not assigned</option>
                  <option value={list?.creator._id}>{list?.creator.username} (Creator)</option>
                  {list?.collaborators.map(collaborator => (
                    <option key={collaborator._id} value={collaborator._id}>
                      {collaborator.username}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Priority */}
              <div>
                <select
                  value={newItemPriority}
                  onChange={(e) => setNewItemPriority(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            
            {/* Notes - Full Width */}
            <div>
              <textarea
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAddItem}
              disabled={!newItemText.trim()}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Filtering and Sorting Controls */}
        {list.items.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-neutral-700">Filter by Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-neutral-700">Filter by Assignee:</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  <option value={list.creator._id}>{list.creator.username} (Creator)</option>
                  {list.collaborators.map(collaborator => (
                    <option key={collaborator._id} value={collaborator._id}>
                      {collaborator.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-neutral-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="addedAt">Date Added</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                </select>
              </div>
            </div>
          </div>
        )}

      {/* Items List */}
      <div className="space-y-6">
        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-800">
                Pending Items ({pendingItems.length})
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div key={item._id} className="p-3 sm:p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item._id)}
                          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <button
                          onClick={() => handleToggleItem(item._id, true)}
                          className="w-5 h-5 border-2 border-neutral-300 rounded hover:border-success-500 transition-colors flex-shrink-0"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="text-neutral-900 font-medium truncate">{item.text}</h4>
                              {item.quantity && (
                                <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md flex-shrink-0">
                                  Qty: {item.quantity}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </div>
                            
                            {item.notes && (
                              <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{item.notes}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 text-xs text-neutral-500">
                              <span>Added by {item.addedBy?.username || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(item.addedAt)}</span>
                              
                              {item.dueDate && (
                                <>
                                  <span>•</span>
                                  <span className="text-warning-600 font-medium">
                                    Due: {formatDate(item.dueDate)}
                                  </span>
                                </>
                              )}
                              
                              {item.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span className="text-primary-600">
                                    Assigned to {item.assignedTo.username}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-4">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-200"
                              title="Edit item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="p-2 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-all duration-200"
                              title="Delete item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-800">
                Completed Items ({completedItems.length})
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div key={item._id} className="p-3 sm:p-4 bg-success-50 rounded-xl border border-success-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item._id)}
                          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <button
                          onClick={() => handleToggleItem(item._id, false)}
                          className="w-5 h-5 bg-success-500 rounded flex items-center justify-center hover:bg-success-600 transition-colors flex-shrink-0"
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="text-neutral-500 line-through font-medium truncate">{item.text}</h4>
                              {item.quantity && (
                                <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md flex-shrink-0 line-through">
                                  Qty: {item.quantity}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full border opacity-60 flex-shrink-0 ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </div>
                            
                            {item.notes && (
                              <p className="text-sm text-neutral-400 mb-2 line-clamp-2 line-through">{item.notes}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 text-xs text-neutral-400">
                              <span>Completed by {item.completedBy?.username || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(item.completedAt)}</span>
                              
                              {item.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span>Was assigned to {item.assignedTo.username}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-4">
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="p-2 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-all duration-200"
                              title="Delete item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No items */}
        {list.items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-500">Add your first item to get started!</p>
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-neutral-800">Edit Item</h3>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Item Text</label>
                <input
                  type="text"
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({...editingItem, text: e.target.value})}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Quantity</label>
                <input
                  type="text"
                  value={editingItem.quantity || ''}
                  onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Optional"
                />
              </div>
              
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={editingItem.dueDate ? editingItem.dueDate.split('T')[0] : ''}
                  onChange={(e) => setEditingItem({...editingItem, dueDate: e.target.value})}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Assigned To</label>
                <select
                  value={editingItem.assignedTo?._id || ''}
                  onChange={(e) => setEditingItem({...editingItem, assignedTo: e.target.value ? {_id: e.target.value} : null})}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Not assigned</option>
                  <option value={list.creator._id}>{list.creator.username} (Creator)</option>
                  {list.collaborators.map(collaborator => (
                    <option key={collaborator._id} value={collaborator._id}>
                      {collaborator.username}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Priority</label>
                <select
                  value={editingItem.priority || 'medium'}
                  onChange={(e) => setEditingItem({...editingItem, priority: e.target.value})}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Notes</label>
                <textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-4 sm:px-6 py-4 rounded-b-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleEditItem(editingItem._id, {
                    text: editingItem.text,
                    quantity: editingItem.quantity || undefined,
                    dueDate: editingItem.dueDate || undefined,
                    assignedTo: editingItem.assignedTo?._id || undefined,
                    priority: editingItem.priority,
                    notes: editingItem.notes || undefined
                  })}
                  disabled={!editingItem.text.trim()}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Collaborator Modal */}
      {showAddCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800">Add Collaborator</h3>
            </div>
            
            <div className="p-4 sm:p-6">
              {getAvailableFriends().length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-neutral-500">
                    All your friends are already collaborating on this list!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getAvailableFriends().map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 truncate">{friend.username}</div>
                          <div className="text-xs text-neutral-500 truncate">{friend.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCollaborator(friend._id)}
                        className="px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0 ml-3"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-neutral-200">
              <button
                onClick={() => setShowAddCollaborator(false)}
                className="w-full px-4 py-3 bg-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-300 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onBulkComplete={handleBulkComplete}
        onBulkDelete={handleBulkDelete}
        onBulkAssign={handleBulkAssign}
        collaborators={getAllCollaborators()}
      />
      </div>
    </div>
  );
};

export default SharedListDetailsPage;
