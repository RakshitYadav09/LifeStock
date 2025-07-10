 # Resend Email Service Setup for LifeStock

## Overview
LifeStock now uses Resend for email notifications across tasks, events, and shared lists. This document provides setup instructions and configuration details.

## Installation

```bash
cd server
npm install resend
```

## Configuration

### 1. Environment Variables
Add the following to your `.env` file:

```env
# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=LifeStock <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:3000
```

### 2. Get Resend API Key
1. Go to [Resend.com](https://resend.com)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key to your `.env` file

### 3. Domain Verification (Production)
For production, you'll need to verify your domain:
1. Go to your Resend dashboard
2. Add your domain in the Domains section
3. Follow the DNS verification steps
4. Update `EMAIL_FROM` with your verified domain

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
const { sendEmail } = require('./utils/emailServiceResend');

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

## Monitoring

### Email Delivery
Monitor email delivery in your Resend dashboard:
- Delivery rates
- Bounce rates  
- Open rates
- Click rates

### Server Logs
Check server logs for email-related errors:
```bash
# Look for email service logs
tail -f server.log | grep -i email
```

## Rate Limits

Resend Free Tier:
- 3,000 emails per month
- 100 emails per day

For higher volume, upgrade to a paid plan.

## Customization

### 1. Email Templates
Edit templates in `server/utils/emailServiceResend.js`:
- Update styling
- Add/remove content sections
- Modify branding

### 2. Email Triggers
Modify when emails are sent by updating controllers:
- `taskController.js` - Task notifications
- `calendarController.js` - Event notifications
- `sharedListController.js` - List notifications
- `userController.js` - User notifications

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Verify API key is correct
   - Check environment variable name
   - Ensure API key has proper permissions

2. **Domain Verification**
   - Verify domain in Resend dashboard
   - Check DNS records
   - Wait for propagation (up to 24 hours)

3. **Email Not Delivered**
   - Check spam folder
   - Verify recipient email address
   - Check Resend dashboard for delivery status

### Debug Mode
Enable debug logging:
```javascript
// In emailServiceResend.js
console.log('Email sent successfully:', data);
console.error('Email failed:', error);
```

## Security

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor for suspicious activity

## Backup Options

If Resend is unavailable, you can switch to:
- Gmail SMTP
- SendGrid
- Mailgun
- Amazon SES

Update the email service import in controllers to switch providers.

## Support

For issues:
1. Check this documentation
2. Review server logs
3. Check Resend dashboard
4. Contact Resend support for API-related issues

---

**Note**: Remember to update your API key in the `.env` file before testing!
