# SMTP Email Service Setup for LifeStock

## Overview
LifeStock now uses SMTP for email notifications across tasks, events, and shared lists. This guide provides setup instructions for popular email providers.

## Installation

```bash
cd server
npm install nodemailer
```

## Configuration

### 1. Environment Variables
Add the following to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=LifeStock <your_email@gmail.com>
FRONTEND_URL=http://localhost:3000
```

### 2. Email Provider Setup

#### Gmail (Recommended)
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an "App Password":
   - Go to Security > 2-Step Verification > App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
4. Use this app password in `SMTP_PASS`

**Gmail Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
EMAIL_FROM=LifeStock <your_email@gmail.com>
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
EMAIL_FROM=LifeStock <your_email@outlook.com>
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
EMAIL_FROM=LifeStock <your_email@yahoo.com>
```

#### Custom SMTP Server
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
EMAIL_FROM=LifeStock <your_email@yourdomain.com>
```

## Email Types

### 1. Task Notifications
- **Task Shared**: When a task is shared with another user
- **Task Reminder**: Daily reminders for due tasks (via scheduler)

### 2. Event Notifications
- **Event Invitation**: When invited to an event
- **Event Reminder**: Before event start time (via scheduler)

### 3. List Notifications
- **Shared List Invite**: When invited to collaborate on a list

### 4. User Notifications
- **Welcome Email**: When a new user registers

## Email Templates

All email templates are responsive and include:
- Professional LifeStock branding
- Clear call-to-action buttons
- Proper formatting for desktop and mobile
- Consistent styling across all email types

## Features

### 1. Task Sharing
```javascript
// When creating a task with shared users
const task = await Task.create({
  title: "Sample Task",
  sharedWith: [userId1, userId2],
  // ... other fields
});

// Email automatically sent to shared users
```

### 2. Event Invitations
```javascript
// When creating an event with participants
const event = await CalendarEvent.create({
  title: "Team Meeting",
  participants: [userId1, userId2],
  // ... other fields
});

// Email automatically sent to participants
```

### 3. Shared List Invites
```javascript
// When creating a shared list
const sharedList = await SharedList.create({
  name: "Shopping List",
  collaborators: [userId1, userId2],
  // ... other fields
});

// Email automatically sent to collaborators
```

## Error Handling

Email failures are handled gracefully:
- Tasks/events/lists are still created even if email fails
- Errors are logged for debugging
- Users receive in-app notifications as backup

## Testing

### Development Testing
```javascript
// Test email sending
const { sendEmail } = require('./utils/emailServiceSMTP');

await sendEmail(
  'test@example.com',
  'Test Subject',
  '<h1>Test Email</h1>'
);
```

### Production Testing
1. Create a test user account
2. Share a task with another user
3. Check email delivery
4. Verify email rendering in different clients

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - For Gmail: Use App Password, not regular password
   - Enable 2-factor authentication first
   - Check username/password combination

2. **Connection Refused**
   - Verify SMTP host and port
   - Check firewall settings
   - Ensure less secure apps are enabled (if required)

3. **Gmail Specific Issues**
   - Enable 2-factor authentication
   - Generate App Password for the application
   - Use App Password in SMTP_PASS, not regular password

4. **Emails Going to Spam**
   - Use a professional "From" address
   - Include proper email headers
   - Consider using a custom domain

### Debug Mode
Enable debug logging in `emailServiceSMTP.js`:
```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  debug: true, // Enable debug mode
  logger: true, // Enable logging
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Use App Passwords instead of regular passwords**
4. **Regularly rotate App Passwords**
5. **Monitor for suspicious activity**

## Rate Limits

### Gmail
- 500 emails per day for free accounts
- 2000 emails per day for Google Workspace accounts
- 100 emails per hour sending limit

### Outlook
- 300 emails per day for free accounts
- Higher limits for paid accounts

### Yahoo
- 500 emails per day for free accounts

## Alternative Providers

If you encounter issues with free providers, consider:
- **Mailgun**: 5,000 emails/month free
- **SendGrid**: 100 emails/day free
- **Amazon SES**: Pay-per-use pricing
- **Postmark**: High deliverability rates

## Monitoring

### Server Logs
Monitor email activity in server logs:
```bash
# Look for email service logs
tail -f server.log | grep -i email
```

### Email Delivery
- Check spam folders
- Monitor bounce rates
- Test with different email providers

## Customization

### 1. Email Templates
Edit templates in `server/utils/emailServiceSMTP.js`:
- Update styling and branding
- Add/remove content sections
- Modify call-to-action buttons

### 2. Email Triggers
Modify when emails are sent by updating controllers:
- `taskController.js` - Task notifications
- `calendarController.js` - Event notifications
- `sharedListController.js` - List notifications
- `userController.js` - User notifications

## Support

For issues:
1. Check this documentation
2. Review server logs
3. Verify email provider settings
4. Test with different email accounts
5. Check spam folders

## Quick Setup Checklist

- [ ] Install nodemailer: `npm install nodemailer`
- [ ] Update `.env` with SMTP credentials
- [ ] For Gmail: Enable 2FA and generate App Password
- [ ] Test email sending with a simple test
- [ ] Create test user account and verify welcome email
- [ ] Test task sharing and event invitations
- [ ] Check email deliverability and spam folders

---

**Note**: Remember to use App Passwords for Gmail and enable 2-factor authentication!
