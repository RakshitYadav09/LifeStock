require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const friendshipRoutes = require('./routes/friendshipRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const sharedListRoutes = require('./routes/sharedListRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { scheduleReminders, setSocketIO } = require('./utils/reminderScheduler');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set Socket.IO instance for reminder scheduler
setSocketIO(io);

// Middleware
app.use(express.json());

// CORS configuration for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CLIENT_URL, // This will be your Vercel frontend URL
    ];
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/friends', friendshipRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/shared-lists', sharedListRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LifeStock Task Management API is running!',
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for personal notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join task-specific room for shared task updates
  socket.on('join_task_room', (taskId) => {
    socket.join(`task-${taskId}`);
    console.log(`Socket ${socket.id} joined task room: ${taskId}`);
  });

  // Join list-specific room for shared list updates
  socket.on('join_list_room', (listId) => {
    socket.join(`list-${listId}`);
    console.log(`Socket ${socket.id} joined list room: ${listId}`);
  });

  // Join calendar event room
  socket.on('join_event_room', (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`Socket ${socket.id} joined event room: ${eventId}`);
  });

  // Leave rooms
  socket.on('leave_task_room', (taskId) => {
    socket.leave(`task-${taskId}`);
    console.log(`Socket ${socket.id} left task room: ${taskId}`);
  });

  socket.on('leave_list_room', (listId) => {
    socket.leave(`list-${listId}`);
    console.log(`Socket ${socket.id} left list room: ${listId}`);
  });

  socket.on('leave_event_room', (eventId) => {
    socket.leave(`event-${eventId}`);
    console.log(`Socket ${socket.id} left event room: ${eventId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible globally for controllers
global.io = io;

const PORT = process.env.PORT || 5000;

// Initialize reminder scheduler
scheduleReminders();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO server initialized');
});
