import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../context/UserCollaborationContext';
import { useNotification } from '../context/NotificationContext';
import { createSharedList, deleteSharedList } from '../services/api';
import { Link } from 'react-router-dom';

const SharedListsPage = () => {
  const { sharedLists, friends, refreshSharedLists } = useCollaboration();
  const { showError, showSuccess } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listForm, setListForm] = useState({
    name: '',
    description: '',
    type: 'custom',
    collaborators: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshSharedLists();
  }, [refreshSharedLists]);

  const handleCreateList = async () => {
    if (!listForm.name.trim()) return;

    setIsLoading(true);
    try {
      await createSharedList(listForm);
      refreshSharedLists();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating shared list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async (listId) => {
    // Remove confirmation dialog and use toast notification
    try {
      await deleteSharedList(listId);
      refreshSharedLists();
      showSuccess('List deleted successfully');
    } catch (error) {
      showError('Failed to delete list');
    }
  };

  const resetForm = () => {
    setListForm({
      name: '',
      description: '',
      type: 'custom',
      collaborators: []
    });
  };

  const toggleCollaborator = (friendId) => {
    setListForm(prev => ({
      ...prev,
      collaborators: prev.collaborators.includes(friendId)
        ? prev.collaborators.filter(id => id !== friendId)
        : [...prev.collaborators, friendId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getListTypeColor = (type) => {
    switch (type) {
      case 'grocery': return 'bg-green-100 text-green-800 border-green-200';
      case 'expense': return 'bg-red-100 text-red-800 border-red-200';
      case 'todo': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New List
        </button>
      </div>

      {sharedLists.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first list to organize tasks and collaborate with friends.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedLists.map((list) => (
            <div key={list._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
                    {list.description && (
                      <p className="text-gray-600 text-sm mb-3">{list.description}</p>
                    )}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getListTypeColor(list.type)}`}>
                        {list.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {list.items ? list.items.length : 0} items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creator and Collaborators */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Created by {list.creator?.username || 'Unknown'} • {formatDate(list.createdAt)}
                  </div>
                  {list.collaborators && list.collaborators.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Collaborators:</div>
                      <div className="flex flex-wrap gap-1">
                        {list.collaborators.slice(0, 3).map((collaborator) => (
                          <div
                            key={collaborator._id}
                            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            title={collaborator.username || 'Unknown'}
                          >
                            {collaborator.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        ))}
                        {list.collaborators.length > 3 && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            +{list.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Items Preview */}
                {list.items && list.items.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Recent items:</div>
                    <div className="space-y-1">
                      {list.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className={`w-3 h-3 rounded border ${
                            item.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {item.completed && (
                              <svg className="w-2 h-2 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                      {list.items.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{list.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/shared-lists/${list._id}`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    View List
                  </Link>
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Shared List</h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name *
                </label>
                <input
                  type="text"
                  value={listForm.name}
                  onChange={(e) => setListForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Grocery List, Project Tasks"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={listForm.description}
                  onChange={(e) => setListForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              {/* List Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Type
                </label>
                <select
                  value={listForm.type}
                  onChange={(e) => setListForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="custom">Custom</option>
                  <option value="todo">Todo List</option>
                  <option value="grocery">Grocery List</option>
                  <option value="expense">Expense List</option>
                </select>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share this list with friends (optional)
                </label>
                {friends && friends.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    <p className="text-xs text-gray-600 mb-2">
                      Select friends to collaborate on this list:
                    </p>
                    {friends.map((friend) => {
                      if (!friend) return null;
                      
                      return (
                        <label
                          key={friend._id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={listForm.collaborators.includes(friend._id)}
                            onChange={() => toggleCollaborator(friend._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {friend.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{friend.username || 'Unknown'}</span>
                        </label>
                      );
                    })}
                    {listForm.collaborators.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        ✓ {listForm.collaborators.length} friend{listForm.collaborators.length > 1 ? 's' : ''} will be added as collaborator{listForm.collaborators.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">
                      Add friends to share lists with them. Go to the Friends page to connect with others.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateList}
                disabled={isLoading || !listForm.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create List'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedListsPage;
