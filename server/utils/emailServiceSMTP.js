const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure SMTP transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email address
    pass: process.env.SMTP_PASS  // your email password or app password
  }
});

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready (SMTP)');
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    console.log('Please check your SMTP configuration in .env file');
  }
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📋 Task Reminder</h1>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">${taskData.title}</h2>
            ${taskData.description ? `<p style="color: #64748b; margin: 0 0 15px 0; line-height: 1.5;">${taskData.description}</p>` : ''}
            
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
              ${taskData.priority ? `<span style="background-color: ${taskData.priority === 'high' ? '#fee2e2' : taskData.priority === 'medium' ? '#fef3c7' : '#f3f4f6'}; color: ${taskData.priority === 'high' ? '#dc2626' : taskData.priority === 'medium' ? '#d97706' : '#6b7280'}; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">${taskData.priority.toUpperCase()} PRIORITY</span>` : ''}
              ${taskData.category ? `<span style="background-color: #dbeafe; color: #2563eb; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">${taskData.category.toUpperCase()}</span>` : ''}
            </div>
          </div>

          ${taskData.dueDate ? `
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #dc2626; font-weight: 500;">
                ⏰ Due: ${new Date(taskData.dueDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              View in LifeStock
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The LifeStock Team</p>
        </div>
      </div>
    `;
  },

  taskShared: (taskData, sharedByUser, sharedWithUser) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">🤝 Task Shared With You</h1>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #64748b; margin: 0 0 15px 0;">
              <strong style="color: #1e293b;">${sharedByUser}</strong> has shared a task with you:
            </p>
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">${taskData.title}</h2>
            ${taskData.description ? `<p style="color: #64748b; margin: 0 0 15px 0; line-height: 1.5;">${taskData.description}</p>` : ''}
            
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
              ${taskData.priority ? `<span style="background-color: ${taskData.priority === 'high' ? '#fee2e2' : taskData.priority === 'medium' ? '#fef3c7' : '#f3f4f6'}; color: ${taskData.priority === 'high' ? '#dc2626' : taskData.priority === 'medium' ? '#d97706' : '#6b7280'}; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">${taskData.priority.toUpperCase()} PRIORITY</span>` : ''}
              ${taskData.category ? `<span style="background-color: #dbeafe; color: #2563eb; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">${taskData.category.toUpperCase()}</span>` : ''}
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              View Shared Task
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The LifeStock Team</p>
        </div>
      </div>
    `;
  },

  eventInvitation: (eventData, invitedByUser) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📅 Event Invitation</h1>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #64748b; margin: 0 0 15px 0;">
              <strong style="color: #1e293b;">${invitedByUser}</strong> has invited you to an event:
            </p>
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">${eventData.title}</h2>
            ${eventData.description ? `<p style="color: #64748b; margin: 0 0 15px 0; line-height: 1.5;">${eventData.description}</p>` : ''}
            
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0 0 10px 0; color: #1e293b; font-weight: 500;">
                📅 ${new Date(eventData.startDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p style="margin: 0; color: #1e293b; font-weight: 500;">
                🕐 ${new Date(eventData.startDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                ${eventData.endDate ? ` - ${new Date(eventData.endDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}` : ''}
              </p>
              ${eventData.location ? `<p style="margin: 10px 0 0 0; color: #1e293b; font-weight: 500;">📍 ${eventData.location}</p>` : ''}
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              View Event
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The LifeStock Team</p>
        </div>
      </div>
    `;
  },

  eventReminder: (eventData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">⏰ Event Reminder</h1>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">${eventData.title}</h2>
            ${eventData.description ? `<p style="color: #64748b; margin: 0 0 15px 0; line-height: 1.5;">${eventData.description}</p>` : ''}
            
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0 0 10px 0; color: #1e293b; font-weight: 500;">
                📅 ${new Date(eventData.startDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p style="margin: 0; color: #1e293b; font-weight: 500;">
                🕐 ${new Date(eventData.startDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                ${eventData.endDate ? ` - ${new Date(eventData.endDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}` : ''}
              </p>
              ${eventData.location ? `<p style="margin: 10px 0 0 0; color: #1e293b; font-weight: 500;">📍 ${eventData.location}</p>` : ''}
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              View Event
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The LifeStock Team</p>
        </div>
      </div>
    `;
  },

  sharedListInvite: (listData, invitedByUser) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📝 Shared List Invitation</h1>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #64748b; margin: 0 0 15px 0;">
              <strong style="color: #1e293b;">${invitedByUser}</strong> has shared a list with you:
            </p>
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">${listData.title || listData.name}</h2>
            ${listData.description ? `<p style="color: #64748b; margin: 0 0 15px 0; line-height: 1.5;">${listData.description}</p>` : ''}
            
            ${listData.items && listData.items.length > 0 ? `
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0 0 10px 0; color: #1e293b; font-weight: 500;">List Items:</p>
                <ul style="margin: 0; padding-left: 20px; color: #64748b;">
                  ${listData.items.slice(0, 5).map(item => `<li style="margin-bottom: 5px;">${item.title || item.name || item}</li>`).join('')}
                  ${listData.items.length > 5 ? `<li style="margin-bottom: 5px; color: #6b7280; font-style: italic;">... and ${listData.items.length - 5} more items</li>` : ''}
                </ul>
              </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared-lists" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              View Shared List
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The LifeStock Team</p>
        </div>
      </div>
    `;
  },

  welcomeEmail: (userData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 Welcome to LifeStock!</h1>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">
              Hi <strong>${userData.username}</strong>,
            </p>
            <p style="color: #64748b; margin: 0 0 15px 0; line-height: 1.6;">
              Welcome to LifeStock! We're excited to have you on board. Your account has been successfully created and you're ready to start organizing your life like never before.
            </p>
            
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">🚀 Get Started:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #64748b;">
                <li style="margin-bottom: 8px;">Create your first task</li>
                <li style="margin-bottom: 8px;">Set up your calendar events</li>
                <li style="margin-bottom: 8px;">Share tasks and lists with friends</li>
                <li style="margin-bottom: 8px;">Explore collaborative features</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The LifeStock Team</p>
          <p style="margin-top: 10px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #2563eb; text-decoration: none;">Visit LifeStock</a>
          </p>
        </div>
      </div>
    `;
  }
};

// Helper functions for sending specific types of emails
const sendTaskReminder = async (taskData, userEmail) => {
  const subject = `⏰ Task Reminder: ${taskData.title}`;
  const html = emailTemplates.taskReminder(taskData);
  return await sendEmail(userEmail, subject, html);
};

const sendTaskSharedNotification = async (taskData, sharedByUser, sharedWithUser) => {
  const subject = `🤝 Task Shared: ${taskData.title}`;
  const html = emailTemplates.taskShared(taskData, sharedByUser, sharedWithUser);
  return await sendEmail(sharedWithUser, subject, html);
};

const sendEventInvitation = async (eventData, invitedByUser, inviteeEmail) => {
  const subject = `📅 Event Invitation: ${eventData.title}`;
  const html = emailTemplates.eventInvitation(eventData, invitedByUser);
  return await sendEmail(inviteeEmail, subject, html);
};

const sendEventReminder = async (eventData, userEmail) => {
  const subject = `⏰ Event Reminder: ${eventData.title}`;
  const html = emailTemplates.eventReminder(eventData);
  return await sendEmail(userEmail, subject, html);
};

const sendSharedListInvite = async (listData, invitedByUser, inviteeEmail) => {
  const subject = `📝 Shared List Invitation: ${listData.title || listData.name}`;
  const html = emailTemplates.sharedListInvite(listData, invitedByUser);
  return await sendEmail(inviteeEmail, subject, html);
};

const sendWelcomeEmail = async (userData) => {
  const subject = `🎉 Welcome to LifeStock, ${userData.username}!`;
  const html = emailTemplates.welcomeEmail(userData);
  return await sendEmail(userData.email, subject, html);
};

// Initialize email service
testEmailConfig();

module.exports = {
  sendEmail,
  sendTaskReminder,
  sendTaskSharedNotification,
  sendEventInvitation,
  sendEventReminder,
  sendSharedListInvite,
  sendWelcomeEmail,
  emailTemplates
};
