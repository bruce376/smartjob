const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require("dotenv").config();

const app = express();

// Set mongoose options
mongoose.set('strictQuery', false);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://smartjob.unaux.com',
  'https://smartjob.unaux.com',
  'https://smartjobconnekt.netlify.app', // Your Netlify URL
  'https://smartjob-api-ugtf.onrender.com', // Your Render API URL
  'https://smartjob-api-ugtf.onrender.com' // Duplicate for safety
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Pass to next layer of middleware
  next();
});
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
    res.send("SmartJobConnect Backend is running!");
});

// MongoDB connection - Connect FIRST before loading routes
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ MONGO_URI environment variable is not set");
    process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log("🔄 Attempting to connect to MongoDB...");
        console.log("🔗 Connection string:", 
            mongoURI.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/, "$1*****$3"));
            
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        
        console.log("✓ MongoDB connected successfully");
        return true;
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        console.error("🔍 Error details:", {
            name: err.name,
            code: err.code,
            codeName: err.codeName,
            errorLabels: err.errorLabels
        });
        
        console.error("\n💡 Troubleshooting tips:");
        console.error("   1. Check your internet connection");
        console.error("   2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)");
        console.error("   3. Check if your MongoDB cluster is active and accessible");
        console.error("   4. Verify credentials in .env file");
        console.error("   5. Ensure your MongoDB user has the correct permissions");
        console.error("   6. Check MongoDB Atlas logs for connection attempts");
        
        console.error("\n⚠️  Server will continue without database connection for static file serving...\n");
        return false;
    }
};

// Load routes
const authRoutes = require("./routes/auths");
const testAuthRoutes = require("./routes/test-auth");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/job");
const applicationRoutes = require("./routes/application");
const uploadRoutes = require("./routes/file-upload");
const adminRoutes = require("./routes/admin");
const aiRoutes = require("./routes/ai");
const googleAuthRoutes = require("./routes/google-auth");
const seedRoutes = require("./routes/seed");
const testUsersRoutes = require("./routes/test-users");

// Initialize the server
const startServer = async () => {
    try {
        // Try to connect to MongoDB, but continue even if it fails
        const dbConnected = await connectDB();
        
        if (!dbConnected) {
            console.log("⚠️  Starting server in limited mode (file serving only)...");
        }
        
        // API root endpoint
        app.get("/api", (req, res) => {
            res.json({
                message: "SmartJobConnect API",
                version: "1.0.0",
                dbConnected: mongoose.connection.readyState === 1,
                endpoints: {
                    jobs: "/api/jobs",
                    auth: "/api/auth",
                    applications: "/api/applications",
                    ai: "/api/ai",
                    upload: "/api/upload"
                }
            });
        });

        // Register routes
        app.use("/api/test", testAuthRoutes); // Test routes (temporary)
        app.use("/api/jobs", jobRoutes);
        app.use("/api/auth", authRoutes);
        app.use("/api/users", userRoutes);
        app.use("/api/applications", applicationRoutes);
        app.use("/api/upload", uploadRoutes);
        app.use("/api/admin", adminRoutes);
        app.use("/api/ai", aiRoutes);
        app.use("/api/auth/google", googleAuthRoutes);
        app.use("/api/seed", seedRoutes);
        app.use("/api/test-users", testUsersRoutes);

        // Serve uploaded files (CVs, etc.) - This works without DB
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

        // Serve static files from the React app
        app.use(express.static(path.join(__dirname, '../frontend/dist')));
        
        console.log("✓ Routes registered");
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ API available at http://localhost:${PORT}/api`);
            console.log(`✓ File uploads available at http://localhost:${PORT}/uploads`);
            console.log(`✓ CV download endpoint: http://localhost:${PORT}/api/upload/download-cv/:filename`);
            if (mongoose.connection.readyState === 1) {
                console.log(`✓ Database: Connected`);
            } else {
                console.log(`⚠️  Database: Not connected (file serving still works)`);
            }
        });
    } catch (error) {
        console.error("❌ Server startup error:", error);
        process.exit(1);
    }
};

// Start the server
startServer();
