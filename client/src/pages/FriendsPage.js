import React, { useState, useContext } from 'react';
import { useCollaboration } from '../context/UserCollaborationContext';
import AuthContext from '../context/AuthContext';
import UserSearchComponent from '../components/UserSearchComponent';

const FriendsPage = () => {
  const {
    friends,
    pendingRequests,
    sentRequests,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriend
  } = useCollaboration();
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('friends');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  const getExcludedUserIds = () => {
    const excludedIds = [user?.id];
    
    // Add friends
    friends.forEach(friend => {
      if (friend?._id) {
        excludedIds.push(friend._id);
      }
    });
    
    // Add pending requests
    pendingRequests.forEach(request => {
      if (request?.requester?._id) {
        excludedIds.push(request.requester._id);
      }
    });
    
    // Add sent requests
    sentRequests.forEach(request => {
      if (request?.recipient?._id) {
        excludedIds.push(request.recipient._id);
      }
    });
    
    return excludedIds.filter(id => id !== undefined);
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      await handleSendFriendRequest(selectedUser._id);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const confirmRemoveFriend = async (friendshipId) => {
    try {
      await handleRemoveFriend(friendshipId);
      setShowRemoveConfirm(null);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Friends & Collaboration</h1>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
        {[
          { key: 'friends', label: 'Friends', count: friends.length },
          { key: 'pending', label: 'Requests', count: pendingRequests.length },
          { key: 'sent', label: 'Sent', count: sentRequests.length },
          { key: 'search', label: 'Find Friends', count: null }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Your Friends</h2>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You don't have any friends yet.</p>
              <p className="text-sm">Search for users to send friend requests!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => {
                if (!friend) return null;
                
                return (
                  <div key={friend._id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {friend.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{friend.username || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">{friend.email || ''}</p>
                        {friend.friendsSince && (
                          <p className="text-xs text-gray-400">Friends since {formatDate(friend.friendsSince)}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRemoveConfirm(friend.friendshipId)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Friend Requests</h2>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending friend requests.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => {
                if (!request?.requester) return null;
                
                return (
                  <div key={request._id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.requester.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{request.requester.username || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">{request.requester.email || ''}</p>
                        <p className="text-xs text-gray-400">Requested {formatDate(request.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptFriendRequest(request._id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(request._id)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Sent Requests</h2>
          {sentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sent friend requests.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sentRequests.map((request) => {
                if (!request?.recipient) return null;
                
                return (
                  <div key={request._id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.recipient.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{request.recipient.username || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">{request.recipient.email || ''}</p>
                        <p className="text-xs text-gray-400">Sent {formatDate(request.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Find Friends</h2>
          
          {/* User Search Component */}
          <div className="max-w-md">
            <UserSearchComponent 
              onUserSelect={handleUserSelect}
              excludeUserIds={getExcludedUserIds()}
              placeholder="Search for users to add as friends..."
            />
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Search for users to send friend requests!</p>
            <p className="text-xs mt-2">Enter at least 2 characters to start searching.</p>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Friend</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this friend? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => confirmRemoveFriend(showRemoveConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
              <button
                onClick={() => setShowRemoveConfirm(null)}
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

export default FriendsPage;
