# Database Seeding Guide

## 📋 Overview

This guide explains how to populate your SmartJob database with sample job listings.

## 📁 Files Created

1. **`jobs.js`** - Contains 15 sample job listings with various categories, locations, and types
2. **`seed.js`** - Standalone script to seed the database (requires MongoDB Atlas IP whitelisting)
3. **`routes/seed.js`** - API endpoint for seeding through the running server
4. **`seed-helper.html`** - User-friendly web interface to seed the database

## 🚀 How to Seed the Database

### Method 1: Using the Web Interface (Recommended)

1. **Make sure your backend server is running:**
   ```bash
   cd backend
   node server.js
   ```

2. **Open the seed helper in your browser:**
   - Open `backend/seed-helper.html` in your web browser
   - Click "Check Status" to see current database state
   - Click "Seed Database" to populate with 15 sample jobs

### Method 2: Using API Directly

1. **Start the backend server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Send a POST request to the seed endpoint:**
   ```bash
   # Using curl
   curl -X POST http://localhost:5000/api/seed

   # Using PowerShell
   Invoke-WebRequest -Uri http://localhost:5000/api/seed -Method POST
   ```

3. **Check the status:**
   ```bash
   curl http://localhost:5000/api/seed/status
   ```

### Method 3: Using the Standalone Script

1. **Ensure your IP is whitelisted in MongoDB Atlas**
2. **Run the seed script:**
   ```bash
   cd backend
   npm run seed
   ```

## 📊 What Gets Created

- **15 Sample Jobs** across various categories:
  - Software Development (Full Stack, Frontend, Backend, Mobile)
  - Design (UI/UX)
  - Data Science (Data Analyst, Machine Learning)
  - DevOps
  - Product Management
  - Customer Service
  - Cybersecurity
  - Content Writing
  - Quality Assurance
  - Business Analysis

- **Default Employer Account** (if none exists):
  - Email: `employer@example.com`
  - Password: `employer123`
  - Role: Employer

## ⚠️ Important Notes

- **Seeding will clear all existing jobs** in the database
- All sample jobs are assigned to the default employer account
- You can modify the jobs in `jobs.js` before seeding
- The seed endpoint is at `/api/seed` (POST) and `/api/seed/status` (GET)

## 🔧 Troubleshooting

### "Could not connect to MongoDB"
- Check if your backend server is running
- Verify MongoDB connection string in `.env` file
- Ensure your IP is whitelisted in MongoDB Atlas

### "No employer found" error
- The script will automatically create a default employer account
- Use the credentials above to log in as an employer

### Backend not responding
- Make sure the server is running on port 5000
- Check if port 5000 is not being used by another application
- Restart the server after adding the seed routes

## 🎯 Next Steps

After seeding:
1. Start your frontend application
2. Navigate to the Jobs page
3. You should see all 15 sample jobs
4. Log in as employer (employer@example.com / employer123) to manage jobs
5. Create a job seeker account to apply for jobs

## 📝 Customization

To add or modify sample jobs:
1. Edit `backend/jobs.js`
2. Add/modify job objects in the `sampleJobs` array
3. Re-run the seeding process

Each job should have:
- `title` (string, required)
- `description` (string, required)
- `category` (string)
- `location` (string)
- `type` (string: "Full-Time", "Part-Time", "Remote", "Internship")
- `salary` (string)
