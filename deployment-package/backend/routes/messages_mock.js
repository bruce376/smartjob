const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

// Get real users from database
let cachedUsers = null;
const getUsers = async () => {
  if (!cachedUsers) {
    cachedUsers = await User.find({});
  }
  return cachedUsers;
};

// Mock data for conversations (using real users)
const getMockConversations = async () => {
  const users = await getUsers();
  
  return users.map((user, index) => ({
    id: user._id.toString(), // Convert ObjectId to string
    name: user.name,
    avatar: user.avatar || '/api/placeholder/user/40/40',
    lastMessage: index === 0 ? 'Hi, I\'m interested in the position' : 'Thank you for your application',
    time: index === 0 ? '2 min ago' : '1 hour ago',
    unread: index === 0 ? 2 : 0,
    role: user.role
  }));
};

// Mock data for available users (using real users)
const getMockAvailableUsers = async () => {
  const users = await getUsers();
  
  return users.map(user => ({
    id: user._id.toString(), // Convert ObjectId to string
    name: user.name,
    email: user.email,
    avatar: user.avatar || '/api/placeholder/user/40/40',
    role: user.role,
    company: user.company || '',
    skills: user.skills || []
  }));
};

// Mock data for messages
const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    content: 'Hi, I\'m interested in the position',
    sent: false,
    time: '2 min ago'
  },
  {
    id: 2,
    conversationId: 1,
    content: 'Great! Let me review your application',
    sent: true,
    time: '1 min ago'
  },
  {
    id: 3,
    conversationId: 1,
    content: 'Thank you for your response',
    sent: false,
    time: 'Just now'
  }
];

// GET /api/messages/conversations - Get all conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await getMockConversations();
    res.json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// GET /api/messages/available-users - Get available users to message
router.get('/available-users', auth, async (req, res) => {
  try {
    const availableUsers = await getMockAvailableUsers();
    res.json({
      status: 'success',
      data: availableUsers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching available users',
      error: error.message
    });
  }
});

// GET /api/messages/:conversationId - Get messages for a specific conversation
router.get('/:conversationId', auth, (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationMessages = mockMessages.filter(msg => msg.conversationId == conversationId);
    
    res.json({
      status: 'success',
      data: conversationMessages
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

// POST /api/messages/send - Send a new message
router.post('/send', auth, (req, res) => {
  try {
    const { conversationId, content, recipientId } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required'
      });
    }

    const newMessage = {
      id: mockMessages.length + 1,
      conversationId: conversationId || 1,
      content: content.trim(),
      sent: true,
      time: 'Just now'
    };

    mockMessages.push(newMessage);

    res.json({
      status: 'success',
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error sending message',
      error: error.message
    });
  }
});

// DELETE /api/messages/:messageId - Delete a message
router.delete('/:messageId', auth, (req, res) => {
  try {
    const { messageId } = req.params;
    const messageIndex = mockMessages.findIndex(msg => msg.id == messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    mockMessages.splice(messageIndex, 1);

    res.json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting message',
      error: error.message
    });
  }
});

module.exports = router;
