# Push Notification Setup for LifeStock

## Overview
LifeStock now uses web push notifications to notify users about tasks, events, and shared lists. This works on both desktop and mobile devices without requiring emails or a domain.

## Features

### ✅ **What Works**
- **Real-time notifications** for task sharing, event invitations, and list collaborations
- **Cross-platform support** - works on desktop and mobile browsers
- **No email required** - notifications appear directly in the browser/device
- **Interactive notifications** - users can take actions directly from notifications
- **Offline support** - notifications queue when offline and sync when back online
- **Permission-based** - users control when they receive notifications

### 📱 **Notification Types**
1. **Task Sharing**: When someone shares a task with you
2. **Task Reminders**: For upcoming due dates
3. **Event Invitations**: When invited to calendar events
4. **Event Reminders**: Before events start
5. **Shared List Invites**: When invited to collaborate on lists
6. **Welcome Messages**: When new users join

## Server Setup

### 1. Generate VAPID Keys
First, you need to generate VAPID keys for your application:

```bash
# Start your server
npm run dev

# In your browser, visit (development only):
http://localhost:5000/api/push/generate-vapid-keys
```

Copy the generated keys to your `.env` file:
```env
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
CONTACT_EMAIL=admin@lifestock.com
```

### 2. Environment Variables
Your `.env` file should include:
```env
# Push Notification Configuration
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
CONTACT_EMAIL=admin@lifestock.com
FRONTEND_URL=http://localhost:3000
```

## Frontend Integration

### 1. Add the Notification Manager
Add the `PushNotificationManager` component to your settings or dashboard:

```jsx
import PushNotificationManager from '../components/PushNotificationManager';

function SettingsPage() {
  return (
    <div>
      <h2>Notification Settings</h2>
      <PushNotificationManager />
    </div>
  );
}
```

### 2. Service Worker Registration
The service worker (`/public/sw.js`) is automatically registered when users visit the notification settings.

### 3. Initialize Notifications
Users can enable notifications by:
1. Going to notification settings
2. Clicking "Enable Notifications"
3. Allowing permission in the browser prompt

## Browser Support

### ✅ **Supported Browsers**
- **Chrome** 50+ (Desktop & Android)
- **Firefox** 44+ (Desktop & Android)
- **Safari** 16+ (macOS & iOS)
- **Edge** 17+ (Windows)
- **Opera** 39+ (Desktop & Android)

### ❌ **Not Supported**
- Internet Explorer
- Safari < 16 on iOS
- Some older mobile browsers

## User Experience

### 📱 **Mobile Notifications**
- Appear in the device notification tray
- Work even when the browser is closed
- Can include action buttons (View, Complete, Accept, etc.)
- Respect device notification settings

### 🖥️ **Desktop Notifications**
- Appear as system notifications
- Work when browser is minimized
- Include action buttons for quick actions
- Auto-dismiss after a set time

### 🔧 **User Controls**
- Users can enable/disable notifications anytime
- Test notifications to verify setup
- View subscription status across devices
- Manage notification preferences

## Notification Flow

### 1. **Task Sharing**
```
User A shares task → Server sends notification → User B receives notification
→ User B clicks "View Task" → Opens LifeStock app to task page
```

### 2. **Event Invitations**
```
User A creates event → Server sends invitation → User B receives notification
→ User B clicks "Accept" → Opens calendar page with event details
```

### 3. **Reminders**
```
Scheduler runs → Finds due tasks/events → Sends reminders to relevant users
→ Users receive "Task Due" or "Event Starting" notifications
```

## API Endpoints

### Push Notification Routes (`/api/push/`)
- `GET /vapid-public-key` - Get VAPID public key
- `POST /subscribe` - Subscribe to notifications
- `POST /unsubscribe` - Unsubscribe from notifications
- `GET /status` - Get subscription status
- `POST /test` - Send test notification
- `GET /generate-vapid-keys` - Generate VAPID keys (dev only)

## Testing

### 1. **Basic Testing**
1. Enable notifications in the app
2. Use "Send Test Notification" button
3. Verify notification appears

### 2. **Feature Testing**
1. Create a test user account
2. Share a task with another user
3. Check that recipient gets notification
4. Test event invitations and list sharing

### 3. **Mobile Testing**
1. Open app on mobile device
2. Enable notifications
3. Test notifications appear in system tray
4. Verify action buttons work

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**
   - Check browser permission settings
   - Verify VAPID keys are configured
   - Ensure service worker is registered
   - Check browser console for errors

2. **Permission Denied**
   - User must manually enable in browser settings
   - Guide users to browser notification settings
   - Consider showing instructions for each browser

3. **VAPID Keys Not Working**
   - Regenerate keys using the endpoint
   - Ensure both public and private keys are set
   - Check contact email is valid

4. **Service Worker Issues**
   - Check `/sw.js` is accessible
   - Verify service worker registration
   - Clear browser cache and re-register

### Debug Mode
Enable console logging in the browser:
```javascript
// In browser console
localStorage.setItem('pushNotificationDebug', 'true');
```

### Server Logs
Monitor push notification activity:
```bash
# Look for push notification logs
tail -f server.log | grep -i push
```

## Security & Privacy

### 🔒 **Security Features**
- VAPID keys provide application identification
- Subscriptions are tied to user accounts
- Notifications only sent to authorized users
- No sensitive data in notification content

### 🔐 **Privacy Protection**
- Users control notification permissions
- No tracking of notification interactions
- Subscriptions can be revoked anytime
- No personal data stored in push service

## Best Practices

### 📝 **Content Guidelines**
- Keep notification titles under 50 characters
- Use clear, actionable language
- Include relevant emojis for visual appeal
- Provide meaningful action buttons

### ⚡ **Performance**
- Batch notifications when possible
- Use appropriate notification tags
- Implement retry logic for failures
- Clean up invalid subscriptions

### 🎯 **User Experience**
- Ask for permission at appropriate times
- Explain benefits before requesting permission
- Provide easy way to disable notifications
- Respect user preferences

## Production Deployment

### 1. **Server Configuration**
- Generate production VAPID keys
- Set up proper contact email
- Configure CORS for your domain
- Enable HTTPS (required for push notifications)

### 2. **Frontend Deployment**
- Ensure service worker is accessible at `/sw.js`
- Configure proper paths for icons
- Test on production domain
- Verify HTTPS is working

### 3. **Monitoring**
- Monitor notification delivery rates
- Track subscription growth
- Watch for permission denial trends
- Monitor server push queue

## Icons & Assets

Create notification icons in `/public/icons/`:
- `default-icon.png` (192x192) - Default notification icon
- `badge-icon.png` (72x72) - Badge icon for grouped notifications
- `task-icon.png` (64x64) - Task notification icon
- `event-icon.png` (64x64) - Event notification icon
- `list-icon.png` (64x64) - List notification icon

## Migration from Email

If migrating from email notifications:
1. Keep email notifications as fallback
2. Gradually promote push notifications
3. Allow users to choose preferred method
4. Monitor adoption rates
5. Phase out email when adoption is high

---

**Next Steps:**
1. Generate VAPID keys using the API endpoint
2. Add keys to your `.env` file
3. Test notifications in development
4. Add the notification manager to your UI
5. Deploy and test in production

Push notifications provide a much better user experience than emails and work great for real-time collaboration features!
