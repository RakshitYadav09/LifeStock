const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  // Using SendGrid as the email service
  service: 'SendGrid',
  auth: {
    user: process.env.EMAIL_USER || 'apikey', // SendGrid requires 'apikey' as the user
    pass: process.env.EMAIL_PASSWORD // SendGrid API key
  }
});

// Alternative configuration using SMTP directly (e.g. Gmail or other providers)
// Uncomment and use this instead if not using SendGrid
/*
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com' for Gmail
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
*/

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lifestock.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  taskReminder: (taskData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://yourdomain.com/lifestock_logo.svg" alt="LifeStock Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #4F46E5;">Task Reminder</h2>
        <p>Hello ${taskData.userName},</p>
        <p>This is a reminder for your task: <strong>${taskData.title}</strong></p>
        <p><strong>Due Date:</strong> ${new Date(taskData.dueDate).toLocaleString()}</p>
        <p><strong>Description:</strong> ${taskData.description || 'No description provided'}</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/tasks/${taskData._id}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This is an automated message from LifeStock. Please do not reply to this email.
        </p>
      </div>
    `;
  },
  
  eventReminder: (eventData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://yourdomain.com/lifestock_logo.svg" alt="LifeStock Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #4F46E5;">Event Reminder</h2>
        <p>Hello ${eventData.userName},</p>
        <p>Don't forget about your upcoming event: <strong>${eventData.title}</strong></p>
        <p><strong>When:</strong> ${new Date(eventData.start).toLocaleString()}</p>
        <p><strong>Where:</strong> ${eventData.location || 'No location specified'}</p>
        <p><strong>Description:</strong> ${eventData.description || 'No description provided'}</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/calendar" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Calendar</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This is an automated message from LifeStock. Please do not reply to this email.
        </p>
      </div>
    `;
  },
  
  sharedListUpdate: (listData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://yourdomain.com/lifestock_logo.svg" alt="LifeStock Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #4F46E5;">Shared List Update</h2>
        <p>Hello ${listData.recipientName},</p>
        <p>${listData.senderName} has ${listData.action} the shared list: <strong>${listData.listName}</strong></p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/lists/${listData.listId}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View List</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This is an automated message from LifeStock. Please do not reply to this email.
        </p>
      </div>
    `;
  },

  welcomeEmail: (userData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://yourdomain.com/lifestock_logo.svg" alt="LifeStock Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #4F46E5;">Welcome to LifeStock!</h2>
        <p>Hello ${userData.name},</p>
        <p>Thank you for joining LifeStock. We're excited to help you manage your tasks and events efficiently.</p>
        <p>With LifeStock, you can:</p>
        <ul style="margin-left: 20px;">
          <li>Create and manage tasks</li>
          <li>Schedule events and get reminders</li>
          <li>Share lists with friends</li>
          <li>Stay organized with our calendar</li>
        </ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This is an automated message from LifeStock. Please do not reply to this email.
        </p>
      </div>
    `;
  }
};

// Exported functions for different notification types
module.exports = {
  // General email function
  sendEmail,
  
  // Task specific notifications
  sendTaskReminder: async (user, task) => {
    const taskData = {
      _id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      description: task.description,
      userName: user.name
    };
    
    return await sendEmail(
      user.email,
      `Reminder: Task "${task.title}" due soon`,
      emailTemplates.taskReminder(taskData)
    );
  },
  
  // Event specific notifications
  sendEventReminder: async (user, event) => {
    const eventData = {
      title: event.title,
      start: event.start,
      location: event.location,
      description: event.description,
      userName: user.name
    };
    
    return await sendEmail(
      user.email,
      `Reminder: Event "${event.title}" coming up`,
      emailTemplates.eventReminder(eventData)
    );
  },
  
  // Shared list notifications
  sendSharedListNotification: async (recipient, sender, list, action) => {
    const listData = {
      listId: list._id,
      listName: list.name,
      recipientName: recipient.name,
      senderName: sender.name,
      action // e.g., "updated", "shared", "deleted an item from"
    };
    
    return await sendEmail(
      recipient.email,
      `Shared List "${list.name}" ${action}`,
      emailTemplates.sharedListUpdate(listData)
    );
  },
  
  // Welcome email
  sendWelcomeEmail: async (user) => {
    const userData = {
      name: user.name
    };
    
    return await sendEmail(
      user.email,
      'Welcome to LifeStock!',
      emailTemplates.welcomeEmail(userData)
    );
  }
};
