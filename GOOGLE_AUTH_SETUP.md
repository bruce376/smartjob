# 🔐 Google OAuth Setup Guide

## Overview

Adding Google Sign-In to your SmartJob application requires:
1. Setting up Google OAuth credentials
2. Installing required packages
3. Updating backend routes
4. Updating frontend components

## Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Name it: "SmartJob" or similar

### 1.2 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### 1.3 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **SmartJob**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Add `email` and `profile`
   - Test users: Add your email
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **SmartJob Web Client**
   - Authorized JavaScript origins:
     - http://localhost:5173
     - http://localhost:3000
   - Authorized redirect URIs:
     - http://localhost:5173
     - http://localhost:5000/api/auth/google/callback
   - Click **Create**

5. **Copy your credentials:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx`

### 1.4 Add to .env file
Add these to `backend/.env`:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step 2: Install Required Packages

### Backend:
```bash
cd backend
npm install passport passport-google-oauth20 express-session
```

### Frontend:
```bash
cd frontend
npm install @react-oauth/google
```

## Step 3: Implementation Files

I'll create all the necessary files for you.

## Features

✅ Login with Google button
✅ Register with Google button
✅ Automatic account creation
✅ Role selection for new Google users
✅ Seamless integration with existing auth
✅ JWT token generation
✅ Works alongside email/password login

## Security Notes

- Google OAuth tokens are validated server-side
- User data is stored securely in MongoDB
- JWT tokens are generated for session management
- Google refresh tokens are not stored (stateless)

## Testing

1. Click "Login with Google" button
2. Select your Google account
3. Grant permissions
4. Choose your role (Job Seeker or Employer)
5. You'll be logged in automatically!

## Next Steps

After I create the files:
1. Get your Google OAuth credentials
2. Add them to `.env` file
3. Install the packages
4. Restart backend server
5. Restart frontend
6. Test the Google login!
