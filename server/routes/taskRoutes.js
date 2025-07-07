const express = require('express');
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getSharedTasks,
  shareTask,
  unshareTask,
  getUpcomingTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (own and shared)
// @access  Private
router.get('/', protect, getTasks);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', protect, createTask);

// @route   GET /api/tasks/shared
// @desc    Get only shared tasks
// @access  Private
router.get('/shared', protect, getSharedTasks);

// @route   GET /api/tasks/upcoming
// @desc    Get upcoming tasks with due dates
// @access  Private
router.get('/upcoming', protect, getUpcomingTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, deleteTask);

// @route   POST /api/tasks/:id/share
// @desc    Share task with users
// @access  Private
router.post('/:id/share', protect, shareTask);

// @route   POST /api/tasks/:id/unshare
// @desc    Unshare task from users
// @access  Private
router.post('/:id/unshare', protect, unshareTask);

module.exports = router;
