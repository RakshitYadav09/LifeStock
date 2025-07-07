# Google OAuth Configuration Fix

## The Problem
You're getting "Error 400: redirect_uri_mismatch" because your Google Cloud Console configuration doesn't match your application setup.

## Solution Steps

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID and click the edit (pencil) icon

### 2. Configure Authorized JavaScript Origins
In the "Authorized JavaScript origins" section, add:
- `http://localhost:3000` (for development)
- `http://localhost:3000/` (with trailing slash)

### 3. Configure Authorized Redirect URIs
For Google Identity Services, you typically DON'T need redirect URIs, but if the field is required, add:
- `http://localhost:3000`
- `http://localhost:3000/`

### 4. Important Notes
- **DO NOT** add `/auth/google/callback` or similar paths
- **DO NOT** use `https://` for localhost (use `http://`)
- Make sure there are no trailing spaces in your URLs
- The port must match your React app (usually 3000)

### 5. Save and Test
1. Click "Save" in Google Cloud Console
2. Wait a few minutes for changes to propagate
3. Clear your browser cache
4. Try the Google sign-in again

## Alternative: Use Google OAuth 2.0 Flow
If the above doesn't work, I can switch to the traditional OAuth 2.0 flow instead of Google Identity Services.

## Your Current Client ID
```
829189813819-ciqvhl0olkfcrrgq7ib7cr34hq2tpaei.apps.googleusercontent.com
```

Make sure this matches exactly in your Google Cloud Console.
