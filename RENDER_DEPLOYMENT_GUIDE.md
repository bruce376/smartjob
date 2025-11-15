# Render Deployment Guide for SmartJob Backend

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com) if you don't have one)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment Instructions

### 1. Log in to Render

Visit [dashboard.render.com](https://dashboard.render.com) and log in with your account.

### 2. Create a New Web Service

- Click the "New +" button in the top right corner
- Select "Web Service" from the dropdown menu

### 3. Connect Your Repository

- Connect your Git account if not already connected
- Search for and select your repository
- Click "Connect"

### 4. Configure Your Web Service

Fill in the following details:
- **Name**: `smartjob-api`
- **Environment**: `Node`
- **Region**: Choose the region closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 5. Add Environment Variables

Under the "Environment" section, add the following environment variables:
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `JWT_SECRET`: Your JWT secret (the one from your .env file)
- `MONGO_URI`: Your MongoDB connection string
- `JWT_EXPIRE`: `30d`
- `MAX_FILE_SIZE`: `5242880`
- `UPLOAD_DIR`: `./uploads`

### 6. Select a Plan

- Choose the "Free" plan for development/testing
- For production, consider a paid plan for better performance and uptime

### 7. Advanced Settings

- Set the Health Check Path to `/api`
- Enable Auto-Deploy if you want automatic deployments when you push to your repository

### 8. Deploy Your Service

- Click "Create Web Service"
- Render will automatically start building and deploying your application
- Monitor the build logs to ensure everything is working correctly

### 9. Access Your Deployed API

Once deployed, your API will be available at:
```
https://smartjob-api.onrender.com
```

## Troubleshooting

- **Build Failures**: Check the build logs for specific errors
- **Runtime Errors**: Check the logs in the Render dashboard
- **Connection Issues**: Verify your MongoDB connection string and ensure network access
- **CORS Errors**: Make sure your CORS configuration includes your frontend URL

## Persistent File Storage

Note that Render's free tier does not support persistent storage between deployments. If you need to store uploaded files:

1. Consider upgrading to a paid plan with persistent disk
2. Use cloud storage services like AWS S3, Google Cloud Storage, or similar
3. Modify your application to store files in these cloud services instead of local filesystem

## Updating Your Deployment

To update your deployment:
1. Push changes to your Git repository
2. Render will automatically rebuild and deploy (if auto-deploy is enabled)
3. Or manually trigger a deploy from the Render dashboard
