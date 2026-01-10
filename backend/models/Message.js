const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 200
  },
  jobRelated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  messageType: {
    type: String,
    enum: ['job_inquiry', 'come_in', 'general'],
    default: 'general'
  },
  comeInRequest: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewLocation: {
    type: String,
    trim: true,
    maxlength: 200
  },
  sent: {
    type: Boolean,
    default: true
  },
  read: {
    type: Boolean,
    default: false
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1 });

module.exports = mongoose.model('Message', messageSchema);
