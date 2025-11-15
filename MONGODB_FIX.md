# MongoDB Connection Problems - Solutions

## Problem: IP Whitelist Error

**Error Message:**
```
Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Solution 1: Add Your IP to MongoDB Atlas (Recommended)

### Steps:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/

2. **Login** with your credentials

3. **Select your cluster** (Cluster0)

4. **Click "Network Access"** in the left sidebar

5. **Click "Add IP Address"** button

6. **Choose one option:**
   - **Option A**: Click "Add Current IP Address" (your current IP)
   - **Option B**: Click "Allow Access from Anywhere" and enter `0.0.0.0/0`
     - ⚠️ Less secure but works from any location

7. **Click "Confirm"**

8. **Wait 1-2 minutes** for changes to take effect

9. **Test connection** by restarting your backend server

---

## ✅ Solution 2: Use the API Endpoints (Already Set Up)

Since direct database access is blocked, use the API endpoints through the running server:

### Create Test Users:
```bash
# Start backend first
cd backend
node server.js

# Then in another terminal or browser:
# Visit: http://localhost:5000/api/test-users (POST)

# Or use PowerShell:
Invoke-WebRequest -Uri http://localhost:5000/api/test-users -Method POST
```

### Seed Jobs:
```bash
# Visit: http://localhost:5000/api/seed (POST)

# Or use PowerShell:
Invoke-WebRequest -Uri http://localhost:5000/api/seed -Method POST
```

### Use the HTML Helper Pages:
- `frontend/test-login.html` - Create users & test login
- `backend/seed-helper.html` - Seed jobs

---

## ✅ Solution 3: Check Your Connection String

Your current connection string:
```
mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.gjsshpg.mongodb.net/smartjob
```

### Verify:
1. **Username**: ug2424887_db_user ✓
2. **Password**: ninjastorm ✓
3. **Cluster**: cluster0.gjsshpg.mongodb.net ✓
4. **Database**: smartjob ✓

### Test Connection:
```bash
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✓ Connected!')).catch(err => console.log('✗ Error:', err.message));"
```

---

## ✅ Solution 4: Alternative - Use Local MongoDB

If you want to avoid IP whitelist issues entirely:

### Install MongoDB Locally:
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. Start MongoDB service
4. Update `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/smartjob
   ```

---

## 🎯 Recommended Approach

**For Development:**
1. Go to MongoDB Atlas → Network Access
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. This allows connection from any IP
4. Restart your backend server

**For Production:**
1. Whitelist specific IPs only
2. Use environment-specific connection strings
3. Enable additional security features

---

## 🧪 Test After Fixing

### Test 1: Backend Server
```bash
cd backend
node server.js
```

Should see:
```
✓ MongoDB connected successfully
✓ Routes registered
✓ Server running on port 5000
```

### Test 2: Create Test Users
Open browser: `http://localhost:5000/api/test-users` (POST request)
Or use: `frontend/test-login.html`

### Test 3: Login
Use: `frontend/test-login.html` or your React app

---

## 📞 Still Having Issues?

### Check MongoDB Atlas Status:
- Visit: https://status.mongodb.com/
- Ensure no outages

### Verify Credentials:
1. Go to MongoDB Atlas → Database Access
2. Check if user `ug2424887_db_user` exists
3. Reset password if needed
4. Update `.env` file

### Check Firewall:
- Windows Firewall might block MongoDB connections
- Try temporarily disabling to test

---

## 🚀 Quick Fix (Right Now)

**Since your backend server is running, just use the API:**

1. Open `frontend/test-login.html` in browser
2. Click "Create Test Users"
3. Click "Job Seeker" → "Login"
4. Everything works through the API!

**No need to run standalone scripts that require direct DB access.**
