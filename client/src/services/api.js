import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Check if this is a permission error vs authentication error
      const errorMessage = error.response?.data?.message || '';
      
      // If it's a JWT/token related error, redirect to login
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
      // For other 401 errors (permission), let the component handle it
    }
    
    // Handle forbidden errors (403) - permission denied
    if (error.response?.status === 403) {
      // Don't redirect to login for permission errors
      // Let the component handle showing appropriate error messages
      console.log('Permission denied:', error.response?.data?.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// User Authentication
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const registerUser = (userData) => api.post('/users/register', userData);
export const getUserProfile = () => api.get('/users/profile');

// Tasks
export const getTasks = () => api.get('/tasks');
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getSharedTasks = () => api.get('/tasks/shared');
export const getUpcomingTasks = (days = 7) => api.get(`/tasks/upcoming?days=${days}`);
export const shareTask = (id, userIds) => api.post(`/tasks/${id}/share`, { userIds });
export const unshareTask = (id, userIds) => api.post(`/tasks/${id}/unshare`, { userIds });

// Friends & Friendship
export const searchUsers = (query) => api.get(`/friends/search?query=${encodeURIComponent(query)}`);
export const sendFriendRequest = (recipientId) => api.post('/friends/request', { recipientId });
export const acceptFriendRequest = (friendshipId) => api.put(`/friends/accept/${friendshipId}`);
export const rejectFriendRequest = (friendshipId) => api.delete(`/friends/reject/${friendshipId}`);
export const getFriends = () => api.get('/friends');
export const getPendingRequests = () => api.get('/friends/pending');
export const getSentRequests = () => api.get('/friends/sent');
export const removeFriend = (friendshipId) => api.delete(`/friends/${friendshipId}`);

// Calendar Events
export const getCalendarEvents = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/calendar?${params.toString()}`);
};
export const getCalendarEvent = (eventId) => api.get(`/calendar/${eventId}`);
export const createCalendarEvent = (eventData) => api.post('/calendar', eventData);
export const updateCalendarEvent = (eventId, eventData) => api.put(`/calendar/${eventId}`, eventData);
export const deleteCalendarEvent = (eventId) => api.delete(`/calendar/${eventId}`);
export const addEventParticipant = (eventId, participantId) => api.post(`/calendar/${eventId}/participants`, { participantId });
export const removeEventParticipant = (eventId, participantId) => api.delete(`/calendar/${eventId}/participants/${participantId}`);

// Shared Lists
export const getSharedLists = () => api.get('/shared-lists');
export const getSharedList = (listId) => api.get(`/shared-lists/${listId}`);
export const createSharedList = (listData) => api.post('/shared-lists', listData);
export const updateSharedList = (listId, listData) => api.put(`/shared-lists/${listId}`, listData);
export const deleteSharedList = (listId) => api.delete(`/shared-lists/${listId}`);
export const addListItem = (listId, itemData) => api.post(`/shared-lists/${listId}/items`, itemData);
export const updateListItem = (listId, itemId, itemData) => api.put(`/shared-lists/${listId}/items/${itemId}`, itemData);
export const deleteListItem = (listId, itemId) => api.delete(`/shared-lists/${listId}/items/${itemId}`);
export const addListCollaborator = (listId, collaboratorId) => api.post(`/shared-lists/${listId}/collaborators`, { collaboratorId });
export const removeListCollaborator = (listId, collaboratorId) => api.delete(`/shared-lists/${listId}/collaborators/${collaboratorId}`);

// Notifications
export const getNotifications = (page = 1, limit = 20, isRead) => {
  const params = new URLSearchParams({ page, limit });
  if (isRead !== undefined) params.append('isRead', isRead);
  return api.get(`/notifications?${params.toString()}`);
};
export const getUnreadNotificationsCount = () => api.get('/notifications/unread-count');
export const markNotificationAsRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/mark-all-read');
export const deleteNotification = (notificationId) => api.delete(`/notifications/${notificationId}`);
