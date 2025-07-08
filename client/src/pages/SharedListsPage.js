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
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-primary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-500 p-3 rounded-xl shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">Shared Lists</h1>
                <p className="text-neutral-600 mt-1">Collaborate with friends on shared lists</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Create New List</span>
            </button>
          </div>
        </div>        {sharedLists.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No lists yet</h3>
              <p className="text-neutral-500 mb-4">
                Create your first list to organize tasks and collaborate with friends.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Create Your First List</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sharedLists.map((list) => (
              <div key={list._id} className="bg-white rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2 truncate">{list.name}</h3>
                      {list.description && (
                        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{list.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getListTypeColor(list.type)}`}>
                          {list.type}
                        </span>
                        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                          {list.items ? list.items.length : 0} items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Creator and Collaborators */}
                  <div className="mb-4">
                    <div className="text-xs text-neutral-500 mb-2">
                      Created by {list.creator?.username || 'Unknown'} • {formatDate(list.createdAt)}
                    </div>
                    {list.collaborators && list.collaborators.length > 0 && (
                      <div>
                        <div className="text-xs text-neutral-500 mb-2">Collaborators:</div>
                        <div className="flex flex-wrap gap-1">
                          {list.collaborators.slice(0, 4).map((collaborator) => (
                            <div
                              key={collaborator._id}
                              className="w-6 h-6 sm:w-7 sm:h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md"
                              title={collaborator.username || 'Unknown'}
                            >
                              {collaborator.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          ))}
                          {list.collaborators.length > 4 && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-neutral-400 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md">
                              +{list.collaborators.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Items Preview */}
                  {list.items && list.items.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-neutral-500 mb-2">Recent items:</div>
                      <div className="space-y-1.5">
                        {list.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className={`w-3 h-3 rounded border flex-shrink-0 ${
                              item.completed 
                                ? 'bg-success-500 border-success-500' 
                                : 'border-neutral-300'
                            }`}>
                              {item.completed && (
                                <svg className="w-2 h-2 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={`flex-1 truncate ${item.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                        {list.items.length > 3 && (
                          <div className="text-xs text-neutral-400 pl-5">
                            +{list.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Link
                      to={`/shared-lists/${list._id}`}
                      className="flex-1 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      View List
                    </Link>
                    <button
                      onClick={() => handleDeleteList(list._id)}
                      className="px-4 py-2.5 bg-error-500 text-white text-sm font-medium rounded-xl hover:bg-error-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      title="Delete List"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 bg-primary-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Create Shared List</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={listForm.name}
                    onChange={(e) => setListForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Grocery List, Project Tasks"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={listForm.description}
                    onChange={(e) => setListForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>

                {/* List Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    List Type
                  </label>
                  <select
                    value={listForm.type}
                    onChange={(e) => setListForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="custom">Custom</option>
                    <option value="todo">Todo List</option>
                    <option value="grocery">Grocery List</option>
                    <option value="expense">Expense List</option>
                  </select>
                </div>

                {/* Collaborators */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Share this list with friends (optional)
                  </label>
                  {friends && friends.length > 0 ? (
                    <div className="bg-neutral-50 rounded-xl p-4 max-h-48 overflow-y-auto space-y-3">
                      <p className="text-xs text-neutral-600 mb-3">
                        Select friends to collaborate on this list:
                      </p>
                      {friends.map((friend) => {
                        if (!friend) return null;
                        
                        return (
                          <label
                            key={friend._id}
                            className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-xl transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={listForm.collaborators.includes(friend._id)}
                              onChange={() => toggleCollaborator(friend._id)}
                              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                            />
                            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md">
                              {friend.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm text-neutral-700 font-medium flex-1">{friend.username || 'Unknown'}</span>
                          </label>
                        );
                      })}
                      {listForm.collaborators.length > 0 && (
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mt-3">
                          <p className="text-xs text-primary-700 font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {listForm.collaborators.length} friend{listForm.collaborators.length > 1 ? 's' : ''} will be added as collaborator{listForm.collaborators.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-neutral-50 rounded-xl p-4 text-center">
                      <div className="w-12 h-12 bg-neutral-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-neutral-500">
                        Add friends to share lists with them. Go to the Friends page to connect with others.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={handleCreateList}
                  disabled={isLoading || !listForm.name.trim()}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isLoading ? 'Creating...' : 'Create List'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SharedListsPage;
