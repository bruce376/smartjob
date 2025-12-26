const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Import existing backend routes
const authRoutes = require("./routes/auths");
const jobRoutes = require("./routes/job");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/application");
const adminRoutes = require("./routes/admin");
const fileUploadRoutes = require("./routes/file-upload");

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://smartjob:smartjob123@smartjobdb.0uq8n.mongodb.net/smartjob?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", fileUploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "SmartJob API is running on Firebase Functions",
    timestamp: new Date().toISOString(),
    environment: "production"
  });
});

// Export Firebase Function
exports.api = functions.https.onRequest(app);
