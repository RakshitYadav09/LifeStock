# SendGrid Setup Guide for LifeStock

## 1. Create a SendGrid Account

1. Go to [SendGrid's website](https://sendgrid.com/) and sign up for a free account
2. Complete the registration process
3. Verify your email address to activate your account

## 2. Create an API Key

1. Log in to your SendGrid dashboard
2. Navigate to **Settings** → **API Keys** in the left sidebar
3. Click **Create API Key**
4. Name your key (e.g., "LifeStock Email Service")
5. Select **Full Access** or customize permissions (at minimum, select "Mail Send" access)
6. Click **Create & View**
7. **IMPORTANT**: Copy your API key and store it safely. You will only see it once!

## 3. Verify a Sender Identity

SendGrid requires you to verify the email address you'll use as the sender:

1. Go to **Settings** → **Sender Authentication** in the left sidebar
2. Choose **Single Sender Verification** (simplest option)
3. Fill in the form with your details:
   - **From Email Address**: The email you want to send from (e.g., noreply@yourdomain.com)
   - **From Name**: "LifeStock App"
   - **Reply To**: Your support email or the same as the From address
   - **Company Address** and **City/State/Country/Zip**: Your business details
4. Click **Create**
5. Check the inbox of the email address you entered and follow the verification link

## 4. Update Your Environment Variables

1. Create or edit the `.env` file in your server directory:

```
# Email Configuration
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key_here
EMAIL_FROM=your_verified_email@example.com
CLIENT_URL=http://localhost:3000
```

## 5. Test Your SendGrid Integration

1. Start your server:
   ```
   npm run dev
   ```

2. Register a new user in your application with a valid email address

3. Check if the welcome email arrives in the inbox

4. Monitor your server logs for any email-related errors
