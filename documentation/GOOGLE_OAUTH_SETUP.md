# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for your LifeStock application, making it more secure by replacing localStorage-based authentication with Google's OAuth system.

## What's Been Added

### Frontend (Client)
- **GoogleOAuth Component**: A React component that handles Google sign-in
- **Updated AuthContext**: Now includes `loginWithGoogle` method
- **Updated Login/Register Pages**: Added Google OAuth buttons
- **JWT Handling**: Uses jwt-decode to handle Google tokens

### Backend (Server)
- **Google OAuth Route**: `/api/users/google-login` endpoint
- **Google Token Verification**: Verifies Google tokens server-side
- **Enhanced User Model**: Added Google-specific fields
- **Automatic User Creation**: Creates users automatically from Google profiles

## Setup Steps

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Identity" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized origins:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Save and copy the Client ID

### 2. Environment Configuration

#### Client (.env file)
Create a `.env` file in the client directory:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_API_URL=http://localhost:5000/api
```

#### Server (.env file)
Update your server `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/tasksapp
JWT_SECRET=your_jwt_secret_key_here_replace_in_production
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Install Dependencies

Dependencies are already installed:
- **Client**: `google-auth-library`, `jwt-decode`
- **Server**: `google-auth-library`

### 4. Security Features

#### Enhanced Security
- **Server-side Token Verification**: Google tokens are verified on the server
- **JWT Tokens**: Secure JWT tokens are issued after Google authentication
- **Automatic User Management**: Users are created/updated automatically
- **Profile Integration**: Google profile pictures and names are imported

#### User Model Updates
The User model now includes:
- `googleId`: Google user identifier
- `profilePicture`: Google profile picture URL
- `isGoogleUser`: Flag to identify Google users

### 5. How It Works

1. **User clicks "Continue with Google"**
2. **Google OAuth popup appears**
3. **User authorizes the application**
4. **Google returns an ID token**
5. **Frontend sends token to backend**
6. **Backend verifies token with Google**
7. **Backend creates/updates user account**
8. **Backend returns JWT token**
9. **User is logged in**

### 6. Testing

1. Start your server: `npm run dev` (in server directory)
2. Start your client: `npm start` (in client directory)
3. Visit `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the OAuth flow

### 7. Security Considerations

- **Token Expiration**: JWT tokens expire after 1 day
- **Secure Storage**: Tokens are stored securely in localStorage
- **Server Verification**: All Google tokens are verified server-side
- **Profile Protection**: User profiles are protected by JWT middleware

### 8. Production Deployment

When deploying to production:
1. Update authorized origins in Google Console
2. Update environment variables with production values
3. Ensure HTTPS is used for production
4. Consider implementing refresh tokens for longer sessions

## Files Modified

### Client
- `src/components/GoogleOAuth.js` (new)
- `src/context/AuthContext.js` (updated)
- `src/pages/LoginPage.js` (updated)
- `src/pages/RegisterPage.js` (updated)
- `.env.example` (new)

### Server
- `controllers/userController.js` (updated)
- `models/User.js` (updated)
- `routes/userRoutes.js` (updated)
- `.env` (updated)

## Benefits

1. **Enhanced Security**: No more localStorage-based auth
2. **Better User Experience**: One-click sign-in with Google
3. **Automatic Profile Setup**: Users get profile pictures and names
4. **Reduced Friction**: No need to remember passwords
5. **Industry Standard**: OAuth 2.0 is the gold standard for authentication

## Next Steps

1. Test the Google OAuth flow thoroughly
2. Consider adding other OAuth providers (GitHub, Microsoft, etc.)
3. Implement refresh tokens for longer sessions
4. Add user profile management features
5. Consider implementing two-factor authentication
