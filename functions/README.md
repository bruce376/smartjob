# SmartJob Backend

This is the backend API for SmartJob, a job search and application platform.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file (see `.env.example` for reference)
4. Start the development server: `npm run dev`

## Deploying to Render

This backend is configured for easy deployment to Render. Follow these steps to deploy:

1. Sign up or log in to [Render](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Configure with the following settings:
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `JWT_SECRET`: (Your JWT secret)
   - `MONGO_URI`: (Your MongoDB connection string)
   - `JWT_EXPIRE`: `30d`
   - `MAX_FILE_SIZE`: `5242880`
   - `UPLOAD_DIR`: `./uploads`
6. Deploy your service

For more detailed instructions, see the [RENDER_DEPLOYMENT_GUIDE.md](../RENDER_DEPLOYMENT_GUIDE.md) in the project root.

## API Endpoints

- Authentication: `/api/auth`
- Jobs: `/api/jobs`
- Applications: `/api/applications`
- Users: `/api/users`
- Admin: `/api/admin`
- File Upload: `/api/upload`
- AI Features: `/api/ai`

## Environment Variables

See `.env.example` or `.env.production` for a list of required environment variables.

## Note on File Storage

The current implementation stores uploaded files in the local filesystem. For production deployments on Render, this is not ideal as the filesystem is ephemeral. Consider integrating with a cloud storage solution like AWS S3 for production use.
