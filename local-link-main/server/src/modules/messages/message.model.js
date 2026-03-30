import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Conversation participants
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

  // Related entities
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },

  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Message content
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },

  subject: {
    type: String,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },

  // Message status
  isRead: {
    type: Boolean,
    default: false
  },

  readAt: Date,

  // Message type
  messageType: {
    type: String,
    enum: ['inquiry', 'booking', 'general', 'support'],
    default: 'inquiry'
  }

}, {
  timestamps: true
});

// Indexes
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ service: 1 });
messageSchema.index({ booking: 1 });

// Static: Get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const messages = await this.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
    .sort('createdAt')
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email')
    .populate('recipient', 'name email');

  return messages;
};

// Static: Get user's messages
messageSchema.statics.getUserMessages = async function(userId, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  const skip = (page - 1) * limit;

  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const messages = await this.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email')
    .populate('service', 'title');

  return messages;
};

// Method: Mark as read
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
  return this;
};

export default mongoose.model('Message', messageSchema);
