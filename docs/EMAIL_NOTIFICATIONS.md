# Email Notifications for LifeStock App

This document explains how to set up and use the email notification system added to the LifeStock app.

## Features

The email notification system in LifeStock provides:

- Welcome emails for new users
- Task assignment/sharing notifications
- Event invitations
- Daily summaries of tasks and events
- Upcoming task reminders
- Event reminders (1 hour before)
- Shared list updates

## Setup Instructions

### 1. Choose an Email Provider

You have two options for sending emails:

#### Option 1: SendGrid (Recommended for Production)

1. Create a free [SendGrid](https://sendgrid.com/) account (100 emails/day free)
2. Generate an API key from your SendGrid dashboard
3. Update your `.env` file with:
   ```
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM=your_verified_sender_email@example.com
   ```

#### Option 2: Direct SMTP (e.g., Gmail)

1. If using Gmail:
   - Create an "App Password" from your Google Account settings
   - Update `.env` with:
     ```
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_SECURE=false
     EMAIL_USER=your_gmail@gmail.com
     EMAIL_PASSWORD=your_app_password
     EMAIL_FROM=your_gmail@gmail.com
     ```

### 2. Update Environment Variables

Create or update your `.env` file in the `server/` directory with these settings:

```
# Required email settings
EMAIL_USER=apikey_or_email
EMAIL_PASSWORD=your_api_key_or_password
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL (for email links)
CLIENT_URL=http://localhost:3000

# Optional for direct SMTP (not needed for SendGrid)
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
```

### 3. Choosing Between SendGrid and SMTP

Open `server/utils/emailService.js` and uncomment the appropriate configuration:

- For SendGrid: Use the default configuration (no changes needed)
- For direct SMTP: Comment out the SendGrid configuration and uncomment the SMTP configuration

## Testing the Email Service

To test if emails are working:

1. Register a new user with a valid email address
2. You should receive a welcome email
3. Create and share a task with another user
4. Create a calendar event and invite users

## Troubleshooting

If emails are not being sent:

1. Check the server console for error messages
2. Verify your API key or credentials are correct
3. Make sure your sender email is verified with your provider
4. Check your email provider's sending limits
5. For Gmail, ensure "Less secure apps" is enabled or use App Passwords

## Customizing Email Templates

Email templates are defined in `server/utils/emailService.js`. To customize:

1. Locate the appropriate template in the `emailTemplates` object
2. Modify the HTML structure and styling as needed
3. Remember to restart the server after changes

## Limitations with the Free Tier

- SendGrid: 100 emails per day on the free tier
- Rate limiting may apply
- Template customization is limited (advanced templates require paid plans)

For high-volume production use, consider upgrading to a paid plan with SendGrid or another email service provider.
