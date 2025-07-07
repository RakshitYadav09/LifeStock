const express = require('express');
const router = express.Router();
const {
  createSharedList,
  getSharedLists,
  getSharedList,
  updateSharedList,
  deleteSharedList,
  addListItem,
  updateListItem,
  deleteListItem,
  addCollaborator,
  removeCollaborator
} = require('../controllers/sharedListController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   POST /api/shared-lists
// @desc    Create shared list
// @access  Private
router.post('/', createSharedList);

// @route   GET /api/shared-lists
// @desc    Get user's shared lists
// @access  Private
router.get('/', getSharedLists);

// @route   GET /api/shared-lists/:listId
// @desc    Get single shared list
// @access  Private
router.get('/:listId', getSharedList);

// @route   PUT /api/shared-lists/:listId
// @desc    Update shared list
// @access  Private
router.put('/:listId', updateSharedList);

// @route   DELETE /api/shared-lists/:listId
// @desc    Delete shared list
// @access  Private
router.delete('/:listId', deleteSharedList);

// @route   POST /api/shared-lists/:listId/items
// @desc    Add item to shared list
// @access  Private
router.post('/:listId/items', addListItem);

// @route   PUT /api/shared-lists/:listId/items/:itemId
// @desc    Update list item
// @access  Private
router.put('/:listId/items/:itemId', updateListItem);

// @route   DELETE /api/shared-lists/:listId/items/:itemId
// @desc    Delete list item
// @access  Private
router.delete('/:listId/items/:itemId', deleteListItem);

// @route   POST /api/shared-lists/:listId/collaborators
// @desc    Add collaborator to shared list
// @access  Private
router.post('/:listId/collaborators', addCollaborator);

// @route   DELETE /api/shared-lists/:listId/collaborators/:collaboratorId
// @desc    Remove collaborator from shared list
// @access  Private
router.delete('/:listId/collaborators/:collaboratorId', removeCollaborator);

module.exports = router;
