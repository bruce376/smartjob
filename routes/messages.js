const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Get all conversations for the current user
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id);
    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// Get conversation with a specific user
router.get('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Validate that the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const messages = await Message.getConversation(req.user.id, userId, parseInt(limit));
    
    // Mark messages as read
    await Message.updateMany(
      { 
        sender: userId, 
        recipient: req.user.id, 
        read: false 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      count: messages.length,
      data: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { recipient, content, subject, jobRelated, applicationRelated, messageType = 'direct' } = req.body;

    // Validate required fields
    if (!recipient || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and content are required'
      });
    }

    // Validate recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user.id,
      recipient,
      content: content.trim(),
      subject: subject?.trim(),
      jobRelated,
      applicationRelated,
      messageType
    });

    // Populate sender and recipient info
    await message.populate('sender', 'name email role');
    await message.populate('recipient', 'name email role');
    if (jobRelated) {
      await message.populate('jobRelated', 'title');
    }
    if (applicationRelated) {
      await message.populate('applicationRelated', 'status');
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or recipient
    if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
});

// Get users that can be messaged (for new message functionality)
router.get('/available-users', async (req, res) => {
  try {
    // Get all users except the current user
    const users = await User.find({
      _id: { $ne: req.user.id }
    })
    .select('name email role')
    .sort({ name: 1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available users',
      error: error.message
    });
  }
});

// Get available users for messaging
router.get('/available-users', async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id }
    })
    .select('name email role')
    .sort({ name: 1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available users',
      error: error.message
    });
  }
});

// Get come-in requests for employer's jobs
router.get('/come-in-requests', async (req, res) => {
  try {
    const comeInRequests = await Message.find({
      recipient: req.user.id,
      messageType: 'come_in',
      jobRelated: { $exists: true }
    })
    .populate('sender', 'name email')
    .populate('jobRelated', 'title')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: comeInRequests.length,
      data: comeInRequests
    });
  } catch (error) {
    console.error('Error fetching come-in requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching come-in requests',
      error: error.message
    });
  }
});

module.exports = router;
