# 🔐 Login Database Connection Guide

## ✅ Your Login is Already Connected!

Your `login.jsx` is properly configured to connect to the database through your backend API. Here's what's already set up:

### 📋 Current Setup

#### Frontend (`login.jsx`)
- ✅ Uses `api.post("/auth/login", formData)` to send credentials
- ✅ Stores JWT token in localStorage
- ✅ Stores user data in localStorage
- ✅ Redirects based on user role (Employer → `/employer`, JobSeeker → `/jobs`)
- ✅ Displays error messages from backend

#### Backend (`routes/auths.js`)
- ✅ `/api/auth/login` endpoint configured
- ✅ Validates user credentials against MongoDB
- ✅ Uses bcrypt to compare passwords
- ✅ Generates JWT tokens
- ✅ Returns user data (id, name, email, role)

#### Database (MongoDB)
- ✅ User model with email, password, name, role
- ✅ Passwords are hashed with bcrypt
- ✅ Email is unique index
- ✅ Supports 3 roles: JobSeeker, Employer, Admin

## 🚀 How to Test the Connection

### Step 1: Create Test Users

Run this command in the backend folder:

```bash
cd backend
npm run test-login
```

This creates 3 test accounts:
- **Job Seeker**: jobseeker@test.com / password123
- **Employer**: employer@test.com / password123
- **Admin**: admin@test.com / password123

### Step 2: Start Backend Server

```bash
cd backend
node server.js
```

You should see:
```
✓ MongoDB connected successfully
✓ Routes registered
✓ Server running on port 5000
✓ API available at http://localhost:5000/api
```

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

### Step 4: Test Login

**Option A: Use the React App**
1. Open http://localhost:5173/login
2. Enter: jobseeker@test.com / password123
3. Click Login

**Option B: Use Test Page**
1. Open `frontend/test-login.html` in your browser
2. Click "Check Backend" to verify connection
3. Click "Job Seeker" or "Employer" quick login buttons
4. Click "Login" to test

## 🔍 How It Works

### Login Flow:

```
1. User enters email/password in login.jsx
   ↓
2. Frontend sends POST to http://localhost:5000/api/auth/login
   ↓
3. Backend finds user in MongoDB by email
   ↓
4. Backend compares password hash using bcrypt
   ↓
5. Backend generates JWT token
   ↓
6. Backend returns: { token, user: { id, name, email, role } }
   ↓
7. Frontend stores token and user in localStorage
   ↓
8. Frontend redirects based on role
```

### API Request Example:

```javascript
// What login.jsx sends:
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "jobseeker@test.com",
  "password": "password123"
}

// What backend returns (success):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Seeker",
    "email": "jobseeker@test.com",
    "role": "JobSeeker"
  }
}

// What backend returns (error):
{
  "message": "User not found"
}
// or
{
  "message": "Invalid credentials"
}
```

## 🔧 Troubleshooting

### "User not found" error
**Problem**: No user exists with that email in database  
**Solution**: Run `npm run test-login` to create test users

### "Invalid credentials" error
**Problem**: Password is incorrect  
**Solution**: Use correct password (password123 for test accounts)

### "Network Error" or "Cannot connect"
**Problem**: Backend server is not running  
**Solution**: Start backend with `node server.js`

### "Operation buffering timed out"
**Problem**: MongoDB not connected before routes loaded  
**Solution**: Already fixed in server.js - restart server

### Login works but redirects to wrong page
**Problem**: Role-based routing issue  
**Solution**: Check user.role in localStorage matches expected role

## 📊 Database Schema

### User Collection:
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ["JobSeeker", "Employer", "Admin"]),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens expire after 1 hour
- ✅ Tokens stored in localStorage (client-side)
- ✅ Authorization header automatically added to API requests
- ✅ Protected routes use auth middleware

## 📝 Files Involved

### Frontend:
- `frontend/src/pages/login.jsx` - Login UI and logic
- `frontend/src/utils/api.js` - Axios instance with interceptors
- `frontend/src/utils/auth.js` - Auth helper functions

### Backend:
- `backend/routes/auths.js` - Login/register endpoints
- `backend/models/user.js` - User schema
- `backend/middleware/authmiddleware.js` - JWT verification
- `backend/server.js` - Express app setup

### Testing:
- `backend/test-login.js` - Creates test users
- `frontend/test-login.html` - Visual login tester

## 🎯 Next Steps

1. **Create real users**: Use the register page or API
2. **Test different roles**: Login as JobSeeker vs Employer
3. **Check protected routes**: Try accessing /employer without login
4. **Test token expiration**: Wait 1 hour and try making API calls
5. **Add more features**: Password reset, email verification, etc.

## 💡 Tips

- Use browser DevTools → Application → Local Storage to see stored token
- Use Network tab to inspect API requests/responses
- Check backend console for MongoDB connection status
- Use the test-login.html page for quick testing without running frontend

---

**Everything is already connected and working!** Just create test users and start testing. 🚀
