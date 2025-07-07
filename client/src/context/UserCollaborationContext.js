import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';
import socket, { connectSocket, disconnectSocket } from '../services/socket';
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  getSharedTasks,
  getSharedLists,
  getCalendarEvents,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../services/api';

const UserCollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(UserCollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within UserCollaborationProvider');
  }
  return context;
};

export const UserCollaborationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // State management
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Socket connection effect
  useEffect(() => {
    if (user) {
      connectSocket(user.id);
      
      // Socket event listeners
      const handleTaskUpdated = (updatedTask) => {
        setSharedTasks(prev => 
          prev.map(task => task._id === updatedTask._id ? updatedTask : task)
        );
        addNotification({
          type: 'task_updated',
          message: `Task "${updatedTask.title}" was updated`,
          data: updatedTask
        });
      };

      const handleListUpdated = (updatedList) => {
        setSharedLists(prev => 
          prev.map(list => list._id === updatedList._id ? updatedList : list)
        );
        addNotification({
          type: 'list_updated',
          message: `List "${updatedList.name}" was updated`,
          data: updatedList
        });
      };

      const handleEventUpdated = (updatedEvent) => {
        setCalendarEvents(prev => 
          prev.map(event => event._id === updatedEvent._id ? updatedEvent : event)
        );
        addNotification({
          type: 'event_updated',
          message: `Event "${updatedEvent.title}" was updated`,
          data: updatedEvent
        });
      };

      const handleReminder = (reminderData) => {
        addNotification({
          type: 'reminder',
          message: reminderData.message,
          data: reminderData,
          priority: 'high'
        });
      };

      const handleFriendRequest = (friendship) => {
        setPendingRequests(prev => [...prev, friendship]);
        addNotification({
          type: 'friend_request',
          message: `${friendship.requester.username} sent you a friend request`,
          data: friendship
        });
      };

      // Add socket event listeners
      socket.on('taskUpdated', handleTaskUpdated);
      socket.on('listItemUpdated', handleListUpdated);
      socket.on('eventUpdated', handleEventUpdated);
      socket.on('reminder', handleReminder);
      socket.on('friendRequest', handleFriendRequest);

      // Cleanup function
      return () => {
        socket.off('taskUpdated', handleTaskUpdated);
        socket.off('listItemUpdated', handleListUpdated);
        socket.off('eventUpdated', handleEventUpdated);
        socket.off('reminder', handleReminder);
        socket.off('friendRequest', handleFriendRequest);
        disconnectSocket();
      };
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadCollaborationData();
    }
  }, [user]);

  const loadCollaborationData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [
        friendsResponse,
        pendingResponse,
        sentResponse,
        sharedTasksResponse,
        sharedListsResponse,
        eventsResponse,
        notificationsResponse
      ] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getSentRequests(),
        getSharedTasks(),
        getSharedLists(),
        getCalendarEvents(),
        getNotifications()
      ]);

      setFriends(friendsResponse.data);
      setPendingRequests(pendingResponse.data);
      setSentRequests(sentResponse.data);
      setSharedTasks(sharedTasksResponse.data);
      setSharedLists(sharedListsResponse.data);
      setCalendarEvents(eventsResponse.data);
      setNotifications(notificationsResponse.data.notifications || []);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      setError('Failed to load collaboration data');
    } finally {
      setIsLoading(false);
    }
  };

  // Notification management
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Friend management functions
  const handleSendFriendRequest = async (recipientId) => {
    try {
      const response = await sendFriendRequest(recipientId);
      setSentRequests(prev => [...prev, response.data.friendship]);
      addNotification({
        type: 'friend_request_sent',
        message: `Friend request sent to ${response.data.friendship.recipient.username}`,
        data: response.data.friendship
      });
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to send friend request. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid friend request. This user may already be your friend.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found. Please check the username and try again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to send friend requests to this user.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      throw error;
    }
  };

  const handleAcceptFriendRequest = async (friendshipId) => {
    try {
      const response = await acceptFriendRequest(friendshipId);
      const acceptedFriendship = response.data.friendship;
      
      // Move from pending to friends
      setPendingRequests(prev => prev.filter(req => req._id !== friendshipId));
      setFriends(prev => [...prev, {
        _id: acceptedFriendship.requester._id,
        username: acceptedFriendship.requester.username,
        email: acceptedFriendship.requester.email,
        friendshipId: acceptedFriendship._id,
        friendsSince: acceptedFriendship.acceptedAt
      }]);
      
      addNotification({
        type: 'friend_request_accepted',
        message: `You are now friends with ${acceptedFriendship.requester.username}`,
        data: acceptedFriendship
      });
      
      return response.data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      
      let errorMessage = 'Failed to accept friend request. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'You can only accept friend requests sent to you.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Friend request not found. It may have been already processed.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'This friend request is no longer valid.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      throw error;
    }
  };

  const handleRejectFriendRequest = async (friendshipId) => {
    try {
      await rejectFriendRequest(friendshipId);
      setPendingRequests(prev => prev.filter(req => req._id !== friendshipId));
      
      addNotification({
        type: 'info',
        message: 'Friend request rejected'
      });
      
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      
      let errorMessage = 'Failed to reject friend request. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'You can only reject friend requests sent to you.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Friend request not found. It may have been already processed.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      throw error;
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    try {
      await removeFriend(friendshipId);
      setFriends(prev => prev.filter(friend => friend.friendshipId !== friendshipId));
      addNotification({
        type: 'friend_removed',
        message: 'Friend removed successfully'
      });
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      
      let errorMessage = 'Failed to remove friend. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'You can only remove your own friendships.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Friendship not found.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      throw error;
    }
  };

  const handleSearchUsers = async (query) => {
    try {
      const response = await searchUsers(query);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };

  // Refresh functions
  const refreshFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Error refreshing friends:', error);
    }
  };

  const refreshSharedTasks = async () => {
    try {
      const response = await getSharedTasks();
      setSharedTasks(response.data);
    } catch (error) {
      console.error('Error refreshing shared tasks:', error);
    }
  };

  const refreshSharedLists = async () => {
    try {
      const response = await getSharedLists();
      setSharedLists(response.data);
    } catch (error) {
      console.error('Error refreshing shared lists:', error);
    }
  };

  const refreshCalendarEvents = async () => {
    try {
      const response = await getCalendarEvents();
      setCalendarEvents(response.data);
    } catch (error) {
      console.error('Error refreshing calendar events:', error);
    }
  };

  // Notification functions
  const refreshNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id || notif.id) === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => (notif._id || notif.id) !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(notif => !notif.isRead).length;
  };

  const contextValue = {
    // State
    friends,
    pendingRequests,
    sentRequests,
    sharedTasks,
    sharedLists,
    calendarEvents,
    notifications,
    isLoading,
    error,
    
    // Functions
    loadCollaborationData,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriend,
    handleSearchUsers,
    
    // Notification functions
    refreshNotifications,
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
    handleDeleteNotification,
    
    // Refresh functions
    refreshFriends,
    refreshSharedTasks,
    refreshSharedLists,
    refreshCalendarEvents,
    
    // Getters
    getUnreadNotificationsCount,
    getRecentNotifications: (limit = 5) => notifications.slice(0, limit)
  };

  return (
    <UserCollaborationContext.Provider value={contextValue}>
      {children}
    </UserCollaborationContext.Provider>
  );
};

export default UserCollaborationContext;
