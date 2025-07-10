const SharedList = require('../models/SharedList');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const { notificationHelpers } = require('./notificationController');
const { sendNotificationToUser, notificationTemplates } = require('../utils/pushNotificationService');

// Create shared list
const createSharedList = async (req, res) => {
  try {
    const { name, description, collaborators } = req.body;
    const creatorId = req.user.id;

    // Validate collaborators if provided
    if (collaborators && collaborators.length > 0) {
      // Check if all collaborators are friends with the creator
      const friendships = await Friendship.find({
        $or: [
          { requester: creatorId, recipient: { $in: collaborators }, status: 'accepted' },
          { recipient: creatorId, requester: { $in: collaborators }, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(f => 
        f.requester.toString() === creatorId ? f.recipient.toString() : f.requester.toString()
      );

      const invalidCollaborators = collaborators.filter(c => !friendIds.includes(c));
      if (invalidCollaborators.length > 0) {
        return res.status(400).json({ 
          message: "You can only add friends as collaborators",
          invalidCollaborators 
        });
      }
    }

    const sharedList = new SharedList({
      name,
      description,
      creator: creatorId,
      collaborators: collaborators || [],
      items: []
    });

    await sharedList.save();
    
    await sharedList.populate('creator', 'username email');
    await sharedList.populate('collaborators', 'username email');

    // Send notifications to collaborators
    if (collaborators && collaborators.length > 0) {
      const creator = await User.findById(creatorId);
      
      for (const collaboratorId of collaborators) {
        try {
          // Send in-app notification
          await notificationHelpers.listShared(creatorId, collaboratorId, sharedList._id, name);
          
          // Send push notification
          const collaborator = await User.findById(collaboratorId).select('email name username');
          if (collaborator) {
            try {
              const payload = notificationTemplates.sharedListInvite(sharedList, creator.username || creator.name);
              await sendNotificationToUser(collaboratorId, payload);
              console.log(`Shared list invitation notification sent to ${collaborator.username}`);
            } catch (notificationError) {
              console.error('Failed to send shared list invitation notification:', notificationError);
            }
          }
        } catch (notifError) {
          console.error('Error sending list shared notification:', notifError);
        }
      }
    }

    res.status(201).json({
      message: "Shared list created successfully",
      sharedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's shared lists
const getSharedLists = async (req, res) => {
  try {
    const userId = req.user.id;

    const sharedLists = await SharedList.find({
      $or: [
        { creator: userId },
        { collaborators: userId }
      ]
    }).populate('creator', 'username email')
      .populate('collaborators', 'username email')
      .sort({ createdAt: -1 });

    res.json(sharedLists);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single shared list
const getSharedList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    const sharedList = await SharedList.findById(listId)
      .populate('creator', 'username email')
      .populate('collaborators', 'username email')
      .populate('items.addedBy', 'username email');

    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Check if user has access to this list
    const hasAccess = sharedList.creator._id.toString() === userId || 
                     sharedList.collaborators.some(c => c._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "You don't have access to this shared list" });
    }

    res.json(sharedList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update shared list
const updateSharedList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Only creator can update the list details
    if (sharedList.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the list creator can update this list" });
    }

    // Validate collaborators if being updated
    if (updates.collaborators) {
      const friendships = await Friendship.find({
        $or: [
          { requester: userId, recipient: { $in: updates.collaborators }, status: 'accepted' },
          { recipient: userId, requester: { $in: updates.collaborators }, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(f => 
        f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString()
      );

      const invalidCollaborators = updates.collaborators.filter(c => !friendIds.includes(c));
      if (invalidCollaborators.length > 0) {
        return res.status(400).json({ 
          message: "You can only add friends as collaborators",
          invalidCollaborators 
        });
      }
    }

    const updatedList = await SharedList.findByIdAndUpdate(
      listId,
      { name: updates.name, description: updates.description, collaborators: updates.collaborators },
      { new: true, runValidators: true }
    ).populate('creator', 'username email')
     .populate('collaborators', 'username email')
     .populate('items.addedBy', 'username email');

    res.json({
      message: "Shared list updated successfully",
      sharedList: updatedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete shared list
const deleteSharedList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Only creator can delete the list
    if (sharedList.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the list creator can delete this list" });
    }

    await SharedList.findByIdAndDelete(listId);

    res.json({ message: "Shared list deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add item to shared list
const addListItem = async (req, res) => {
  try {
    const { listId } = req.params;
    const { text, quantity, dueDate, assignedTo, priority, notes } = req.body;
    const userId = req.user.id;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Check if user has access to this list
    const hasAccess = sharedList.creator.toString() === userId || 
                     sharedList.collaborators.some(c => c.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "You don't have access to this shared list" });
    }

    // Validate assignedTo user if provided
    if (assignedTo) {
      const isValidAssignee = assignedTo === userId || 
                             sharedList.creator.toString() === assignedTo ||
                             sharedList.collaborators.some(c => c.toString() === assignedTo);
      
      if (!isValidAssignee) {
        return res.status(400).json({ message: "Cannot assign to user who is not a collaborator" });
      }
    }

    const newItem = {
      text,
      quantity: quantity || '',
      completed: false,
      addedBy: userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: assignedTo || undefined,
      priority: priority || 'medium',
      notes: notes || ''
    };

    sharedList.items.push(newItem);
    await sharedList.save();

    await sharedList.populate('creator', 'username email');
    await sharedList.populate('collaborators', 'username email');
    await sharedList.populate('items.addedBy', 'username email');
    await sharedList.populate('items.assignedTo', 'username email');

    // Send notifications to all collaborators except the person who added the item
    const collaboratorIds = [
      sharedList.creator.toString(),
      ...sharedList.collaborators.map(c => 
        typeof c === 'object' && c._id ? c._id.toString() : c.toString()
      )
    ].filter(id => id !== userId);

    if (collaboratorIds.length > 0) {
      try {
        await notificationHelpers.listItemAdded(
          userId, 
          collaboratorIds, 
          sharedList._id, 
          sharedList.name, 
          text
        );
      } catch (notifError) {
        console.error('Error sending list item added notification:', notifError);
      }
    }

    res.json({
      message: "Item added successfully",
      sharedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update list item
const updateListItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Check if user has access to this list
    const hasAccess = sharedList.creator.toString() === userId || 
                     sharedList.collaborators.some(c => c.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "You don't have access to this shared list" });
    }

    const item = sharedList.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Validate assignedTo user if provided
    if (updates.assignedTo !== undefined && updates.assignedTo) {
      const isValidAssignee = updates.assignedTo === userId || 
                             sharedList.creator.toString() === updates.assignedTo ||
                             sharedList.collaborators.some(c => c.toString() === updates.assignedTo);
      
      if (!isValidAssignee) {
        return res.status(400).json({ message: "Cannot assign to user who is not a collaborator" });
      }
    }

    // Update item properties
    if (updates.text !== undefined) item.text = updates.text;
    if (updates.quantity !== undefined) item.quantity = updates.quantity;
    if (updates.assignedTo !== undefined) item.assignedTo = updates.assignedTo || undefined;
    if (updates.priority !== undefined) item.priority = updates.priority;
    if (updates.notes !== undefined) item.notes = updates.notes;
    
    if (updates.completed !== undefined) {
      item.completed = updates.completed;
      if (updates.completed) {
        item.completedBy = userId;
        item.completedAt = new Date();
      } else {
        item.completedBy = undefined;
        item.completedAt = undefined;
      }
    }
    
    if (updates.dueDate !== undefined) {
      item.dueDate = updates.dueDate ? new Date(updates.dueDate) : undefined;
    }

    // Track who updated the item
    item.updatedBy = userId;
    item.updatedAt = new Date();

    await sharedList.save();

    await sharedList.populate('creator', 'username email');
    await sharedList.populate('collaborators', 'username email');
    await sharedList.populate('items.addedBy', 'username email');
    await sharedList.populate('items.completedBy', 'username email');
    await sharedList.populate('items.assignedTo', 'username email');
    await sharedList.populate('items.updatedBy', 'username email');

    res.json({
      message: "Item updated successfully",
      sharedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete list item
const deleteListItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const userId = req.user.id;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Check if user has access to this list
    const hasAccess = sharedList.creator.toString() === userId || 
                     sharedList.collaborators.some(c => c.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: "You don't have access to this shared list" });
    }

    const item = sharedList.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Only item creator or list creator can delete item
    const canDelete = item.addedBy.toString() === userId || sharedList.creator.toString() === userId;
    if (!canDelete) {
      return res.status(403).json({ message: "You can only delete items you added or if you're the list creator" });
    }

    sharedList.items.pull(itemId);
    await sharedList.save();

    await sharedList.populate('creator', 'username email');
    await sharedList.populate('collaborators', 'username email');
    await sharedList.populate('items.addedBy', 'username email');

    res.json({
      message: "Item deleted successfully",
      sharedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add collaborator to shared list
const addCollaborator = async (req, res) => {
  try {
    const { listId } = req.params;
    const { collaboratorId } = req.body;
    const userId = req.user.id;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Only creator can add collaborators
    if (sharedList.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the list creator can add collaborators" });
    }

    // Check if user is already a collaborator
    if (sharedList.collaborators.includes(collaboratorId)) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }

    // Check if collaborator is a friend
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: collaboratorId, status: 'accepted' },
        { recipient: userId, requester: collaboratorId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(400).json({ message: "You can only add friends as collaborators" });
    }

    sharedList.collaborators.push(collaboratorId);
    await sharedList.save();

    await sharedList.populate('creator', 'username email');
    await sharedList.populate('collaborators', 'username email');

    res.json({
      message: "Collaborator added successfully",
      sharedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove collaborator from shared list
const removeCollaborator = async (req, res) => {
  try {
    const { listId, collaboratorId } = req.params;
    const userId = req.user.id;

    const sharedList = await SharedList.findById(listId);
    if (!sharedList) {
      return res.status(404).json({ message: "Shared list not found" });
    }

    // Creator can remove anyone, collaborators can remove themselves
    const canRemove = sharedList.creator.toString() === userId || collaboratorId === userId;
    if (!canRemove) {
      return res.status(403).json({ message: "You don't have permission to remove this collaborator" });
    }

    sharedList.collaborators = sharedList.collaborators.filter(c => c.toString() !== collaboratorId);
    await sharedList.save();

    await sharedList.populate('creator', 'username email');
    await sharedList.populate('collaborators', 'username email');

    res.json({
      message: "Collaborator removed successfully",
      sharedList
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};
