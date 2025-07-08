const Task = require('../models/Task');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// Get all tasks for a user (including shared tasks)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    }).populate('user', 'username email')
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, sharedWith, tags, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a task title' });
    }

    // Validate shared users if provided
    if (sharedWith && sharedWith.length > 0) {
      // Check if all shared users are friends with the creator
      const friendships = await Friendship.find({
        $or: [
          { requester: req.user.id, recipient: { $in: sharedWith }, status: 'accepted' },
          { recipient: req.user.id, requester: { $in: sharedWith }, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(f => 
        f.requester.toString() === req.user.id ? f.recipient.toString() : f.requester.toString()
      );

      const invalidUsers = sharedWith.filter(u => !friendIds.includes(u));
      if (invalidUsers.length > 0) {
        return res.status(400).json({ 
          message: "You can only share tasks with friends",
          invalidUsers 
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      user: req.user.id,
      sharedWith: sharedWith || [],
      isShared: sharedWith && sharedWith.length > 0,
      tags: tags || [],
      category: category || ''
    });

    await task.populate('user', 'username email');
    await task.populate('sharedWith', 'username email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('user', 'username email')
      .populate('sharedWith', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const hasAccess = task.user._id.toString() === req.user.id || 
                     task.sharedWith.some(u => u._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, description, completed, dueDate, priority, sharedWith } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const hasAccess = task.user.toString() === req.user.id || 
                     task.sharedWith.some(u => u.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Only task owner can update sharing settings
    if (sharedWith !== undefined && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only task owner can update sharing settings' });
    }

    // Validate shared users if provided
    if (sharedWith && task.user.toString() === req.user.id) {
      const friendships = await Friendship.find({
        $or: [
          { requester: req.user.id, recipient: { $in: sharedWith }, status: 'accepted' },
          { recipient: req.user.id, requester: { $in: sharedWith }, status: 'accepted' }
        ]
      });

      const friendIds = friendships.map(f => 
        f.requester.toString() === req.user.id ? f.recipient.toString() : f.requester.toString()
      );

      const invalidUsers = sharedWith.filter(u => !friendIds.includes(u));
      if (invalidUsers.length > 0) {
        return res.status(400).json({ 
          message: "You can only share tasks with friends",
          invalidUsers 
        });
      }
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.completed = completed !== undefined ? completed : task.completed;
    task.dueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : undefined) : task.dueDate;
    task.priority = priority || task.priority;
    
    if (sharedWith !== undefined && task.user.toString() === req.user.id) {
      task.sharedWith = sharedWith;
      task.isShared = sharedWith.length > 0;
    }

    const updatedTask = await task.save();
    await updatedTask.populate('user', 'username email');
    await updatedTask.populate('sharedWith', 'username email');
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only task owner can delete the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only task owner can delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get only shared tasks
const getSharedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      sharedWith: req.user.id
    }).populate('user', 'username email')
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share task with friends
const shareTask = async (req, res) => {
  try {
    const { userIds } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only task owner can share the task
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only task owner can share this task' });
    }

    // Validate that all users are friends
    const friendships = await Friendship.find({
      $or: [
        { requester: req.user.id, recipient: { $in: userIds }, status: 'accepted' },
        { recipient: req.user.id, requester: { $in: userIds }, status: 'accepted' }
      ]
    });

    const friendIds = friendships.map(f => 
      f.requester.toString() === req.user.id ? f.recipient.toString() : f.requester.toString()
    );

    const invalidUsers = userIds.filter(u => !friendIds.includes(u));
    if (invalidUsers.length > 0) {
      return res.status(400).json({ 
        message: "You can only share tasks with friends",
        invalidUsers 
      });
    }

    // Add new users to sharedWith (avoid duplicates)
    const newSharedUsers = userIds.filter(userId => !task.sharedWith.includes(userId));
    task.sharedWith.push(...newSharedUsers);
    task.isShared = task.sharedWith.length > 0;

    await task.save();
    await task.populate('user', 'username email name');
    await task.populate('sharedWith', 'username email name');

    // Send email notifications to newly shared users
    for (const userId of newSharedUsers) {
      try {
        const sharedUser = await User.findById(userId);
        if (sharedUser && sharedUser.email) {
          // Create custom email for task sharing
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://yourdomain.com/lifestock_logo.svg" alt="LifeStock Logo" style="max-width: 150px;" />
              </div>
              <h2 style="color: #4F46E5;">Task Shared With You</h2>
              <p>Hello ${sharedUser.name || sharedUser.username},</p>
              <p>${task.user.name || task.user.username} has shared a task with you:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${task.title}</h3>
                <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}</p>
                <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
                <p><strong>Priority:</strong> ${task.priority || 'Normal'}</p>
              </div>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.CLIENT_URL}/tasks/${task._id}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a>
              </div>
            </div>
          `;
          
          await emailService.sendEmail(
            sharedUser.email,
            `${task.user.username} shared a task with you: ${task.title}`,
            emailContent
          );
          
          console.log(`Task share notification sent to ${sharedUser.email}`);
        }
      } catch (emailError) {
        console.error(`Failed to send task share notification to user ${userId}:`, emailError);
        // Continue with other notifications even if one fails
      }
    }

    res.json({
      message: 'Task shared successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unshare task from specific users
const unshareTask = async (req, res) => {
  try {
    const { userIds } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only task owner can unshare the task
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only task owner can unshare this task' });
    }

    // Remove users from sharedWith
    task.sharedWith = task.sharedWith.filter(userId => !userIds.includes(userId.toString()));
    task.isShared = task.sharedWith.length > 0;

    await task.save();
    await task.populate('user', 'username email');
    await task.populate('sharedWith', 'username email');

    res.json({
      message: 'Task unshared successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks with upcoming due dates
const getUpcomingTasks = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const tasks = await Task.find({
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ],
      dueDate: {
        $gte: new Date(),
        $lte: futureDate
      },
      completed: false
    }).populate('user', 'username email')
      .populate('sharedWith', 'username email')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getSharedTasks,
  shareTask,
  unshareTask,
  getUpcomingTasks
};
