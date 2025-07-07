import { io } from 'socket.io-client';

// Get the API base URL from environment or default to localhost
const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create Socket.IO client instance
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // Don't connect immediately, wait for authentication
});

// Socket connection utilities
export const connectSocket = (userId) => {
  if (userId && !socket.connected) {
    socket.connect();
    socket.emit('join_user_room', userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Room management utilities
export const joinTaskRoom = (taskId) => {
  if (socket.connected) {
    socket.emit('join_task_room', taskId);
  }
};

export const leaveTaskRoom = (taskId) => {
  if (socket.connected) {
    socket.emit('leave_task_room', taskId);
  }
};

export const joinListRoom = (listId) => {
  if (socket.connected) {
    socket.emit('join_list_room', listId);
  }
};

export const leaveListRoom = (listId) => {
  if (socket.connected) {
    socket.emit('leave_list_room', listId);
  }
};

export const joinEventRoom = (eventId) => {
  if (socket.connected) {
    socket.emit('join_event_room', eventId);
  }
};

export const leaveEventRoom = (eventId) => {
  if (socket.connected) {
    socket.emit('leave_event_room', eventId);
  }
};

export default socket;
