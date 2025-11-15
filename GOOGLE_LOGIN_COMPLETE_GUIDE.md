# 🔐 Google Login - Complete Setup Guide

## ✅ Files Created

### Backend:
- ✅ `backend/routes/google-auth.js` - Google OAuth routes
- ✅ `backend/models/user.js` - Updated with Google fields
- ✅ `backend/server.js` - Registered Google auth routes
- ✅ `backend/.env.example` - Environment variables template

### Frontend:
- ✅ `frontend/src/components/GoogleLoginButton.jsx` - Google login component
- ✅ `frontend/src/pages/login.jsx` - Updated with Google button
- ✅ `frontend/src/pages/register.jsx` - Updated with Google button
- ✅ `frontend/src/styles/google-auth.css` - Styles for Google auth
- ✅ `frontend/.env.example` - Environment variables template

---

## 📋 Step-by-Step Setup

### Step 1: Install Required Packages

#### Backend:
```bash
cd backend
# No additional packages needed - using JWT decode
```

#### Frontend:
```bash
cd frontend
npm install @react-oauth/google
```

### Step 2: Get Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project:**
   - Click "Select a project" → "New Project"
   - Name: "SmartJob"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - Click "Create"
   
   **App Information:**
   - App name: `SmartJob`
   - User support email: Your email
   - App logo: (optional)
   
   **App Domain:**
   - Application home page: `http://localhost:5173`
   - Privacy policy: (optional for testing)
   - Terms of service: (optional for testing)
   
   **Developer contact:**
   - Email: Your email
   
   Click "Save and Continue"
   
   **Scopes:**
   - Click "Add or Remove Scopes"
   - Select: `email`, `profile`, `openid`
   - Click "Update" → "Save and Continue"
   
   **Test users:**
   - Add your Gmail address
   - Click "Save and Continue"

5. **Create OAuth Client ID:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `SmartJob Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5000
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:5173
   http://localhost:5000/api/auth/google/callback
   ```
   
   - Click "Create"

6. **Copy Your Credentials:**
   - You'll see a popup with:
     - Client ID: `xxxxx.apps.googleusercontent.com`
     - Client Secret: `xxxxx`
   - **Save these!**

### Step 3: Configure Environment Variables

#### Backend (.env):
```bash
cd backend
# Edit .env file and add:
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

#### Frontend (.env):
```bash
cd frontend
# Create .env file:
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Important:** Use the SAME Client ID in both files!

### Step 4: Import CSS in Your App

Add to `frontend/src/App.jsx` or `frontend/src/main.jsx`:
```javascript
import './styles/google-auth.css';
```

### Step 5: Restart Servers

#### Backend:
```bash
cd backend
# Stop current server (Ctrl+C)
node server.js
```

#### Frontend:
```bash
cd frontend
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing

### Test 1: Login with Google

1. Go to: http://localhost:5173/login
2. Click "Sign in with Google" button
3. Select your Google account
4. Grant permissions
5. **If new user:** Select role (Job Seeker or Employer)
6. You'll be logged in and redirected!

### Test 2: Register with Google

1. Go to: http://localhost:5173/register
2. Click "Sign up with Google" button
3. Select your Google account
4. Choose your role
5. Account created and logged in!

### Test 3: Existing User

1. Create account with email/password
2. Logout
3. Try "Login with Google" using same email
4. Should login to existing account

---

## 🎯 How It Works

### New User Flow:
```
1. User clicks "Sign in with Google"
   ↓
2. Google authentication popup
   ↓
3. User grants permissions
   ↓
4. Google returns credential token
   ↓
5. Frontend sends token to backend
   ↓
6. Backend decodes token, extracts email
   ↓
7. Email not found in database
   ↓
8. Frontend shows role selection modal
   ↓
9. User selects role (Job Seeker/Employer)
   ↓
10. Backend creates new user account
   ↓
11. JWT token generated and returned
   ↓
12. User logged in and redirected
```

### Existing User Flow:
```
1. User clicks "Sign in with Google"
   ↓
2. Google authentication
   ↓
3. Backend finds existing user by email
   ↓
4. JWT token generated
   ↓
5. User logged in immediately
```

---

## 🔒 Security Features

✅ **Google OAuth 2.0** - Industry standard authentication
✅ **JWT Tokens** - Secure session management
✅ **Email Verification** - Google verifies email addresses
✅ **No Password Storage** - For Google users
✅ **Role-Based Access** - Job Seeker vs Employer
✅ **Token Expiration** - 7-day JWT expiry

---

## 🎨 UI Features

✅ **Official Google Button** - Uses Google's design guidelines
✅ **Role Selection Modal** - Beautiful UI for choosing role
✅ **Loading States** - Shows progress during authentication
✅ **Error Handling** - Clear error messages
✅ **Responsive Design** - Works on all devices
✅ **Divider** - "or" separator between Google and email login

---

## 📱 What Users See

### Login Page:
```
┌─────────────────────────────┐
│     Welcome Back            │
│  Login to your SmartJob     │
├─────────────────────────────┤
│  [Sign in with Google 🔵]   │
│                             │
│         ─── or ───          │
│                             │
│  Email: [____________]      │
│  Password: [_________]      │
│  [Login]                    │
└─────────────────────────────┘
```

### Role Selection (New Users):
```
┌─────────────────────────────┐
│    Choose Your Role         │
│  Select how you want to use │
├─────────────────────────────┤
│  ○ 👤 Job Seeker            │
│     Find and apply for jobs │
│                             │
│  ○ 💼 Employer              │
│     Post jobs and hire      │
├─────────────────────────────┤
│  [Cancel]  [Continue]       │
└─────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "Google sign-in failed"
**Solution:** Check that:
- Google Client ID is correct in frontend `.env`
- Backend is running
- CORS is enabled

### Error: "Redirect URI mismatch"
**Solution:**
- Go to Google Cloud Console
- Check Authorized redirect URIs
- Add: `http://localhost:5173`

### Error: "Access blocked: This app's request is invalid"
**Solution:**
- Complete OAuth consent screen setup
- Add your email as test user
- Make sure app is in "Testing" mode

### Button doesn't appear
**Solution:**
- Check browser console for errors
- Verify `@react-oauth/google` is installed
- Check that CSS is imported
- Verify VITE_GOOGLE_CLIENT_ID is set

### Role selection doesn't show
**Solution:**
- This is normal for existing users
- Only new users see role selection
- Check backend logs for errors

---

## 📊 Database Changes

### User Model Updated:
```javascript
{
  name: String,
  email: String,
  password: String,  // Random for Google users
  role: String,      // JobSeeker or Employer
  googleId: String,  // Google user ID (new)
  profilePicture: String,  // Google profile pic (new)
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Next Steps

### Optional Enhancements:

1. **Add Profile Pictures:**
   - Display user's Google profile picture
   - Show in navbar/dashboard

2. **Social Login Icons:**
   - Add Facebook, LinkedIn, GitHub
   - Use same pattern as Google

3. **Account Linking:**
   - Allow users to link Google to existing account
   - Merge accounts

4. **Remember Me:**
   - Extend JWT expiration
   - Add refresh tokens

---

## ✅ Checklist

Before going live:

- [ ] Get Google OAuth credentials
- [ ] Add credentials to `.env` files
- [ ] Install `@react-oauth/google`
- [ ] Import CSS styles
- [ ] Test with your Google account
- [ ] Test role selection for new users
- [ ] Test existing user login
- [ ] Check error handling
- [ ] Test on mobile devices
- [ ] Update OAuth consent screen for production
- [ ] Add privacy policy and terms of service

---

## 🎉 You're Done!

Your SmartJob application now supports:
- ✅ Email/Password login
- ✅ Google OAuth login
- ✅ Role-based authentication
- ✅ Seamless account creation

Users can now sign up and login with just one click using their Google account!
