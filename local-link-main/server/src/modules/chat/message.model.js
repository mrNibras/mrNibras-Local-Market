import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ['text', 'offer', 'system', 'file', 'image'],
    default: 'text'
  },

  // For file/image messages
  fileUrl: String,
  fileName: String,

  // Read receipts
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Message metadata
  metadata: {
    ipAddress: String,
    userAgent: String
  },

  // Edits and deletes
  edited: {
    type: Boolean,
    default: false
  },

  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });

// Virtual for sender info
messageSchema.virtual('senderInfo', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true
});

// Pre-save: Update chat last message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chat, {
      lastMessage: this.content,
      lastMessageAt: new Date()
    });
  }
  next();
});

// Static: Get messages for a chat
messageSchema.statics.getMessages = async function(chatId, options = {}) {
  const { page = 1, limit = 50, before } = options;
  const skip = (page - 1) * limit;

  const query = { chat: chatId, deleted: false };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await this.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email profileImage');

  return messages.reverse(); // Return in chronological order
};

// Static: Mark messages as read
messageSchema.statics.markAsRead = async function(chatId, userId) {
  return await this.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    },
    {
      $addToSet: { readBy: userId }
    }
  );
};

// Method: Edit message
messageSchema.methods.edit = async function(newContent) {
  this.content = newContent;
  this.edited = true;
  await this.save();
  return this;
};

// Method: Delete message (soft delete)
messageSchema.methods.delete = async function() {
  this.deleted = true;
  this.content = '[Message deleted]';
  await this.save();
  return this;
};

export default mongoose.model('Message', messageSchema);
