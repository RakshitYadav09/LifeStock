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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/shared-lists')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Lists</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{list.name}</h1>
          {list.description && (
            <p className="text-gray-600 mt-2">{list.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Created by {list.creator.username}</div>
          <div className="text-sm text-gray-500">{formatDate(list.createdAt)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{list.items.length}</div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
      </div>

      {/* Collaborators */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Collaborators</h2>
          <button
            onClick={() => setShowAddCollaborator(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Collaborator
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Creator */}
          <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {list.creator.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{list.creator.username}</div>
              <div className="text-xs text-blue-600">Creator</div>
            </div>
          </div>

          {/* Collaborators */}
          {list.collaborators.map((collaborator) => (
            <div key={collaborator._id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {collaborator.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{collaborator.username}</div>
                <div className="text-xs text-gray-500">Collaborator</div>
              </div>
              <button
                onClick={() => handleRemoveCollaborator(collaborator._id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
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
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Item Text */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Enter item text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
          </div>
          
          {/* Quantity */}
          <div>
            <input
              type="text"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Quantity (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Due Date */}
          <div>
            <input
              type="date"
              value={newItemDueDate}
              onChange={(e) => setNewItemDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Due date (optional)"
            />
          </div>
          
          {/* Assigned To */}
          <div>
            <select
              value={newItemAssignedTo}
              onChange={(e) => setNewItemAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2">
            <textarea
              value={newItemNotes}
              onChange={(e) => setNewItemNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Filtering and Sorting Controls */}
      {list.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by Assignee:</label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Pending Items ({pendingItems.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div key={item._id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleItemSelection(item._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <button
                        onClick={() => handleToggleItem(item._id, true)}
                        className="w-5 h-5 border-2 border-gray-300 rounded hover:border-green-500 transition-colors mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-gray-900 font-medium">{item.text}</h4>
                              {item.quantity && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Qty: {item.quantity}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </div>
                            
                            {item.notes && (
                              <p className="text-sm text-gray-600 mb-2">{item.notes}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>Added by {item.addedBy?.username || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(item.addedAt)}</span>
                              
                              {item.dueDate && (
                                <>
                                  <span>•</span>
                                  <span className="text-orange-600 font-medium">
                                    Due: {formatDate(item.dueDate)}
                                  </span>
                                </>
                              )}
                              
                              {item.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">
                                    Assigned to {item.assignedTo.username}
                                  </span>
                                </>
                              )}
                              
                              {item.updatedBy && item.updatedAt && (
                                <>
                                  <span>•</span>
                                  <span>Updated by {item.updatedBy.username} on {formatDate(item.updatedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                              title="Edit item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
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
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Completed Items ({completedItems.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div key={item._id} className="p-4 bg-green-50 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleItem(item._id, false)}
                        className="w-5 h-5 bg-green-500 rounded flex items-center justify-center hover:bg-green-600 transition-colors mt-1 flex-shrink-0"
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-gray-500 line-through font-medium">{item.text}</h4>
                              {item.quantity && (
                                <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded line-through">
                                  Qty: {item.quantity}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full border opacity-60 ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </div>
                            
                            {item.notes && (
                              <p className="text-sm text-gray-400 mb-2 line-through">{item.notes}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
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
                          
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Item</h3>
            
            <div className="space-y-4">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Text</label>
                <input
                  type="text"
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({...editingItem, text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="text"
                  value={editingItem.quantity || ''}
                  onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
              
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingItem.dueDate ? editingItem.dueDate.split('T')[0] : ''}
                  onChange={(e) => setEditingItem({...editingItem, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  value={editingItem.assignedTo?._id || ''}
                  onChange={(e) => setEditingItem({...editingItem, assignedTo: e.target.value ? {_id: e.target.value} : null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editingItem.priority || 'medium'}
                  onChange={(e) => setEditingItem({...editingItem, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Collaborator Modal */}
      {showAddCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Collaborator</h3>
            
            {getAvailableFriends().length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                All your friends are already collaborating on this list!
              </p>
            ) : (
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {getAvailableFriends().map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{friend.username}</div>
                        <div className="text-xs text-gray-500">{friend.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddCollaborator(friend._id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowAddCollaborator(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
  );
};

export default SharedListDetailsPage;
