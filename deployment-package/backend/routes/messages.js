const express = require('express');
const router = express.Router();
const { User, Message } = require('../models');
const auth = require('../middleware/authmiddleware');

// GET /api/messages/conversations - Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    })
    .populate('senderId', 'name avatar role')
    .populate('recipientId', 'name avatar role')
    .sort({ createdAt: -1 });

    // Group messages by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUser = message.senderId._id.toString() === userId 
        ? message.recipientId 
        : message.senderId;
      
      const conversationId = otherUser._id.toString();
      
      if (!conversationsMap.has(conversationId)) {
        conversationsMap.set(conversationId, {
          id: conversationId,
          name: otherUser.name,
          avatar: otherUser.avatar || '/api/placeholder/user/40/40',
          lastMessage: message.content,
          time: formatTime(message.createdAt),
          unread: message.recipientId._id.toString() === userId && !message.read ? 1 : 0,
          role: otherUser.role
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());
    
    res.json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// GET /api/messages/conversation/:userId - Get conversation with specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    // Find messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId }
      ]
    })
    .populate('senderId', 'name avatar role')
    .populate('recipientId', 'name avatar role')
    .sort({ createdAt: 1 });

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message._id,
      conversationId: otherUserId,
      content: message.content,
      sent: message.senderId._id.toString() === currentUserId,
      time: formatTime(message.createdAt),
      senderId: message.senderId._id.toString(),
      recipientId: message.recipientId._id.toString()
    }));

    // Mark messages as read
    await Message.updateMany(
      { 
        senderId: otherUserId, 
        recipientId: currentUserId, 
        read: false 
      },
      { read: true }
    );

    res.json({
      status: 'success',
      data: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

// GET /api/messages/available-users - Get available users to message
router.get('/available-users', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get all users except current user
    const users = await User.find({ 
      _id: { $ne: currentUserId } 
    }).select('name email avatar role company skills');

    const availableUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || '/api/placeholder/user/40/40',
      role: user.role,
      company: user.company || '',
      skills: user.skills || []
    }));

    res.json({
      status: 'success',
      data: availableUsers
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching available users',
      error: error.message
    });
  }
});

// POST /api/messages/send - Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;
    const recipientId = conversationId; // conversationId is the recipient's user ID

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required'
      });
    }

    // Create new message
    const message = new Message({
      conversationId: recipientId,
      senderId,
      recipientId,
      content: content.trim(),
      sent: true,
      time: 'Just now'
    });

    await message.save();

    // Populate sender and recipient info
    await message.populate('senderId', 'name avatar role');
    await message.populate('recipientId', 'name avatar role');

    const messageData = {
      id: message._id,
      conversationId: recipientId,
      content: message.content,
      senderId: message.senderId._id.toString(),
      recipientId: message.recipientId._id.toString(),
      sent: true,
      time: 'Just now'
    };

    res.json({
      status: 'success',
      data: messageData
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Helper function to format time
function formatTime(date) {
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

module.exports = router;
