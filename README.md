# SmartJob Platform

A full-stack job search and application platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- 🔐 Secure authentication system with JWT and role-based access
- 🔍 Advanced job search functionality
- 📝 Complete job application system
- 👔 Employer dashboard for job management
- 🧑‍💼 Job seeker dashboard with application tracking
- 📄 CV/Resume upload and management
- 🔮 AI-powered features for job matching
- 👩‍💼 Admin panel for platform management

## Technologies

### Frontend
- React 19
- React Router v7
- Axios for API requests
- Modern UI components
- Responsive design

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- File upload handling
- RESTful API design

## Deployment

- Frontend: Netlify ([smartjobconnekt.netlify.app](https://smartjobconnekt.netlify.app))
- Backend API: Render ([smartjob-api.onrender.com](https://smartjob-api.onrender.com))

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB account or local MongoDB instance
- npm or yarn

### Setup Instructions

1. Clone the repository
   ```
   git clone https://github.com/YOUR_USERNAME/smartjob.git
   cd smartjob
   ```

2. Install dependencies
   ```
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update with your MongoDB URI, JWT secret, etc.

4. Run the application
   ```
   # Start backend server
   cd backend
   npm run dev

   # Start frontend development server
   cd ../frontend
   npm run dev
   ```

## Project Structure

```
smartjob/
├── frontend/             # React frontend
│   ├── public/           # Static assets
│   ├── src/              # React source code
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service calls
│   │   └── utils/        # Helper functions
│   └── package.json      # Frontend dependencies
│
├── backend/              # Express backend
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── models/           # Mongoose models
│   ├── middleware/       # Express middleware
│   └── package.json      # Backend dependencies
│
└── uploads/              # Uploaded files (CVs, etc.)
```

## License

[MIT](LICENSE)

## Contact

Your Name - [your.email@example.com](mailto:your.email@example.com)

Project Link: [https://github.com/YOUR_USERNAME/smartjob](https://github.com/YOUR_USERNAME/smartjob)
