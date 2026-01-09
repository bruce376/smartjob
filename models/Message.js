const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
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
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  jobRelated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  applicationRelated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  messageType: {
    type: String,
    enum: ['direct', 'application', 'job_inquiry', 'come_in'],
    default: 'direct'
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
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Virtual for conversation ID (helps with grouping messages)
messageSchema.virtual('conversationId').get(function() {
  const participants = [this.sender, this.recipient].sort();
  return `${participants[0]}_${participants[1]}`;
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, limit = 50) {
  return this.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'name email role')
  .populate('recipient', 'name email role')
  .populate('jobRelated', 'title')
  .populate('applicationRelated', 'status');
};

// Static method to get all conversations for a user
messageSchema.statics.getUserConversations = async function(userId) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { recipient: new mongoose.Types.ObjectId(userId) }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
            then: '$recipient',
            else: '$sender'
          }
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$read', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'otherUser'
      }
    },
    {
      $unwind: '$otherUser'
    },
    {
      $project: {
        otherUser: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1
        },
        lastMessage: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);

  return conversations;
};

module.exports = mongoose.model('Message', messageSchema);
