const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://smartjobconnekt.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Security middleware
app.use(helmet()); // Adds security headers
app.use(compression()); // Compresses responses

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use(limiter);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://smartjobconnekt.netlify.app',
  'https://umurimoconnect.netlify.app',
  'https://umurimoconnect-mobile.web.app',
  'https://smartjob-ooo2.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log the blocked origin for debugging
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: 10240 })); // Limit request body size to 10KB
app.use(express.urlencoded({ extended: true, limit: 10240 }));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI is not set in environment variables");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// API Routes
const router = express.Router();

// Import route files
const authRoutes = require('./routes/auths');
const jobRoutes = require('./routes/job');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/application');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/aiRoutes');
const messagesRoutes = require('./routes/messages');

// Mount routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/messages', messagesRoutes);

// Test API route
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the SmartJob API!',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      users: '/api/users',
      applications: '/api/applications',
      admin: '/api/admin',
      ai: '/api/ai',
      messages: '/api/messages',
      health: '/api/health'
    }
  });
});

// Mount the router at /api
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Handle 404
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join user to their personal room
  socket.on('joinUser', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle joining conversation rooms
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 User joined conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    console.log(`📨 [RECEIVED] sendMessage event:`, data);
    
    const { conversationId, message, senderId, recipientId } = data;
    
    console.log(`📨 [DATA] Message details:`, { 
      conversationId, 
      message: message ? message.substring(0, 50) + '...' : 'undefined', 
      senderId, 
      recipientId,
      senderSocketId: socket.id 
    });
    
    // Validate required fields
    if (!senderId || !recipientId || !message) {
      console.log(`❌ [ERROR] Invalid message data:`, data);
      socket.emit('messageError', { error: 'Missing required fields' });
      return;
    }
    
    try {
      console.log(`💾 [DATABASE] Saving message to MongoDB...`);
      
      // Save message to database
      const Message = require('./models').Message;
      const newMessage = new Message({
        conversationId: recipientId,
        senderId,
        recipientId,
        content: message,
        sent: true,
        time: 'Just now'
      });
      
      await newMessage.save();
      console.log(`✅ [DATABASE] Message saved with ID: ${newMessage._id}`);
      
      // Populate sender and recipient info
      await newMessage.populate('senderId', 'name avatar role');
      await newMessage.populate('recipientId', 'name avatar role');
      
      // Create message object for real-time delivery
      const messageData = {
        id: newMessage._id,
        conversationId: recipientId,
        content: newMessage.content,
        senderId: newMessage.senderId._id.toString(),
        recipientId: newMessage.recipientId._id.toString(),
        sent: true,
        time: 'Just now'
      };

      console.log(`📤 [SOCKET] Preparing to send message:`, messageData);

      // Get recipient socket
      const recipientSockets = io.sockets.sockets;
      const recipientSocket = Array.from(recipientSockets.values()).find(s => 
        s.userId === recipientId || s.id === recipientId
      );
      
      console.log(`🎯 [SOCKET] Recipient socket found:`, !!recipientSocket);
      
      if (recipientSocket) {
        console.log(`📨 [SOCKET] Sending directly to recipient socket`);
        recipientSocket.emit('newMessage', messageData);
        console.log(`✅ [SOCKET] Message sent directly to ${recipientId}`);
      } else {
        console.log(`⚠️ [SOCKET] Fallback: Sending to room ${recipientId}`);
        // Fallback to room-based sending
        io.to(recipientId).emit('newMessage', messageData);
        console.log(`✅ [SOCKET] Message sent to room ${recipientId}`);
      }
      
      // Send back to sender for confirmation
      socket.emit('messageSent', messageData);
      console.log(`📤 [SOCKET] Confirmation sent to sender: ${senderId}`);
      
      console.log(`💾 [COMPLETE] Message processed successfully`);
    } catch (error) {
      console.error(`❌ [ERROR] Error saving message:`, error);
      socket.emit('messageError', { error: error.message });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { conversationId, userId, isTyping } = data;
    socket.to(conversationId).emit('userTyping', { userId, isTyping });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 Access the API at: http://localhost:${PORT}/api`);
  console.log(`💬 Socket.IO server ready for live chat`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});