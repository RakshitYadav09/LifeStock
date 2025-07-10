const cron = require('node-cron');
const Task = require('../models/Task');
const SharedList = require('../models/SharedList');
const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');
const { sendNotificationToUser, notificationTemplates } = require('./pushNotificationService');

let io = null;


const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// Schedule reminder checking
const scheduleReminders = () => {
  // Check for reminders every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Checking for reminders...');
    await checkTaskReminders();
    await checkListItemReminders();
    await checkEventReminders();
  });

  // Also check every day at 9 AM for daily reminders
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder check...');
    await checkDailyReminders();
  });

  console.log('Reminder scheduler initialized');
};

// Check for task reminders
const checkTaskReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find tasks due tomorrow
    const upcomingTasks = await Task.find({
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      completed: false
    }).populate('user', 'username email name')
      .populate('sharedWith', 'username email name');

    for (const task of upcomingTasks) {
      // Send reminder to task owner
      const ownerReminder = {
        type: 'task_reminder',
        message: `Task "${task.title}" is due tomorrow!`,
        taskId: task._id,
        dueDate: task.dueDate
      };

      if (io) {
        io.to(`user-${task.user._id.toString()}`).emit('reminder', ownerReminder);
      }
      
      // Send email reminder to task owner
      await emailService.sendTaskReminder(task.user, task);

      // Send reminder to shared users
      if (task.sharedWith && task.sharedWith.length > 0) {
        for (const sharedUser of task.sharedWith) {
          const sharedReminder = {
            type: 'shared_task_reminder',
            message: `Shared task "${task.title}" is due tomorrow!`,
            taskId: task._id,
            dueDate: task.dueDate,
            owner: task.user.username
          };

          if (io) {
            io.to(`user-${sharedUser._id.toString()}`).emit('reminder', sharedReminder);
          }
          
          // Send email reminder to shared users
          await emailService.sendTaskReminder(sharedUser, task);
        }
      }

      console.log(`Sent reminders for task: ${task.title}`);
    }
  } catch (error) {
    console.error('Error checking task reminders:', error);
  }
};

// Check for shared list item reminders
const checkListItemReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find shared lists with items due tomorrow
    const listsWithDueItems = await SharedList.find({
      'items.dueDate': {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      'items.completed': false
    }).populate('creator', 'username email name')
      .populate('collaborators', 'username email name');

    for (const list of listsWithDueItems) {
      const dueItems = list.items.filter(item => 
        item.dueDate >= tomorrow && 
        item.dueDate < dayAfterTomorrow && 
        !item.completed
      );

      if (dueItems.length > 0) {
        const itemNames = dueItems.map(item => item.text).join(', ');
        const reminder = {
          type: 'list_item_reminder',
          message: `Items in "${list.name}" are due tomorrow: ${itemNames}`,
          listId: list._id,
          items: dueItems
        };

        // Send to list creator
        if (io) {
          io.to(`user-${list.creator._id.toString()}`).emit('reminder', reminder);
        }
        
        // Send email to list creator
        await emailService.sendSharedListNotification(
          list.creator,
          { name: 'System' },
          { _id: list._id, name: list.name },
          'has items due tomorrow'
        );

        // Send to collaborators
        for (const collaborator of list.collaborators) {
          if (io) {
            io.to(`user-${collaborator._id.toString()}`).emit('reminder', reminder);
          }
          
          // Send email to collaborators
          await emailService.sendSharedListNotification(
            collaborator,
            { name: 'System' },
            { _id: list._id, name: list.name },
            'has items due tomorrow'
          );
        }

        console.log(`Sent reminders for list "${list.name}" with ${dueItems.length} due items`);
      }
    }
  } catch (error) {
    console.error('Error checking list item reminders:', error);
  }
};

// Check for calendar event reminders
const checkEventReminders = async () => {
  try {
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    // Find events starting in the next hour
    const upcomingEvents = await CalendarEvent.find({
      start: {
        $gte: oneHourFromNow,
        $lt: twoHoursFromNow
      }
    }).populate('creator', 'username email name')
      .populate('participants', 'username email name');

    for (const event of upcomingEvents) {
      const reminder = {
        type: 'event_reminder',
        message: `Event "${event.title}" starts in 1 hour!`,
        eventId: event._id,
        startDate: event.startDate
      };

      // Send to event creator
      if (io) {
        io.to(`user-${event.creator._id.toString()}`).emit('reminder', reminder);
      }
      
      // Send email to event creator
      await emailService.sendEventReminder(event.creator, event);

      // Send to participants
      if (event.participants && event.participants.length > 0) {
        for (const participant of event.participants) {
          if (io) {
            io.to(`user-${participant._id.toString()}`).emit('reminder', reminder);
          }
          
          // Send email to participants
          await emailService.sendEventReminder(participant, event);
        }
      }

      console.log(`Sent reminders for event: ${event.title}`);
    }
  } catch (error) {
    console.error('Error checking event reminders:', error);
  }
};

// Daily summary reminders
const checkDailyReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all users with tasks, events, or list items due today
    const todayTasks = await Task.find({
      dueDate: {
        $gte: today,
        $lt: tomorrow
      },
      completed: false
    }).populate('user', 'username email name')
      .populate('sharedWith', 'username email name');

    const todayEvents = await CalendarEvent.find({
      start: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('creator', 'username email name')
      .populate('participants', 'username email name');

    // Group tasks by user
    const userTasks = {};
    for (const task of todayTasks) {
      // Add for task owner
      if (!userTasks[task.user._id.toString()]) {
        userTasks[task.user._id.toString()] = { user: task.user, tasks: [], events: [] };
      }
      userTasks[task.user._id.toString()].tasks.push(task);

      // Add for shared users
      for (const sharedUser of task.sharedWith) {
        if (!userTasks[sharedUser._id.toString()]) {
          userTasks[sharedUser._id.toString()] = { user: sharedUser, tasks: [], events: [] };
        }
        userTasks[sharedUser._id.toString()].tasks.push(task);
      }
    }

    // Group events by user
    for (const event of todayEvents) {
      // Add for event creator
      if (!userTasks[event.creator._id.toString()]) {
        userTasks[event.creator._id.toString()] = { user: event.creator, tasks: [], events: [] };
      }
      userTasks[event.creator._id.toString()].events.push(event);

      // Add for participants
      for (const participant of event.participants) {
        if (!userTasks[participant._id.toString()]) {
          userTasks[participant._id.toString()] = { user: participant, tasks: [], events: [] };
        }
        userTasks[participant._id.toString()].events.push(event);
      }
    }

    // Send daily summary to each user
    for (const [userId, userData] of Object.entries(userTasks)) {
      const { tasks, events } = userData;
      
      if (tasks.length > 0 || events.length > 0) {
        const dailyReminder = {
          type: 'daily_summary',
          message: `You have ${tasks.length} tasks and ${events.length} events due today`,
          tasks: tasks.slice(0, 5), // Limit to first 5 tasks
          events: events.slice(0, 5), // Limit to first 5 events
          totalTasks: tasks.length,
          totalEvents: events.length
        };

        if (io) {
          io.to(`user-${userId}`).emit('reminder', dailyReminder);
        }
        
        // Send email daily summary
        // Construct a custom daily summary email
        const taskList = tasks.slice(0, 5).map(t => t.title).join(', ');
        const eventList = events.slice(0, 5).map(e => e.title).join(', ');
        
        await emailService.sendEmail(
          user.email,
          `LifeStock Daily Summary: ${tasks.length} Tasks & ${events.length} Events Today`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://yourdomain.com/lifestock_logo.svg" alt="LifeStock Logo" style="max-width: 150px;" />
            </div>
            <h2 style="color: #4F46E5;">Your Daily Summary</h2>
            <p>Hello ${user.name},</p>
            <p>Here's what you have planned for today:</p>
            ${tasks.length > 0 ? `<h3>Tasks (${tasks.length})</h3><p>${taskList}${tasks.length > 5 ? '...' : ''}</p>` : ''}
            ${events.length > 0 ? `<h3>Events (${events.length})</h3><p>${eventList}${events.length > 5 ? '...' : ''}</p>` : ''}
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
            </div>
          </div>`
        );
      }
    }

    console.log(`Sent daily summaries to ${Object.keys(userTasks).length} users`);
  } catch (error) {
    console.error('Error checking daily reminders:', error);
  }
};

module.exports = {
  scheduleReminders,
  setSocketIO,
  checkTaskReminders,
  checkListItemReminders,
  checkEventReminders,
  checkDailyReminders
};
