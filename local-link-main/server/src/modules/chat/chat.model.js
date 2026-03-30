import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  // Participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  // Related entities
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },

  // Last message preview
  lastMessage: {
    type: String
  },

  lastMessageAt: {
    type: Date
  },

  // Metadata
  metadata: {
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ booking: 1 });
chatSchema.index({ offer: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Compound index to prevent duplicate chats
chatSchema.index(
  { participants: 1, booking: 1, offer: 1 },
  { unique: true, sparse: true }
);

// Virtual for unread count (computed on retrieval)
chatSchema.virtual('unreadCount').get(function() {
  return this._unreadCount || 0;
});

// Static: Find or create chat
chatSchema.statics.findOrCreateChat = async function(participants, relatedEntity = {}) {
  const { booking, offer, service } = relatedEntity;

  // Try to find existing chat
  let chat = await this.findOne({
    participants: { $all: participants },
    ...(booking && { booking }),
    ...(offer && { offer })
  });

  if (!chat) {
    chat = await this.create({
      participants,
      booking,
      offer,
      service,
      metadata: {
        initiatedBy: participants[0]
      }
    });
  }

  return chat;
};

// Static: Get user chats with pagination
chatSchema.statics.getUserChats = async function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const chats = await this.find({
    participants: userId
  })
    .sort('-lastMessageAt')
    .skip(skip)
    .limit(limit)
    .populate('participants', 'name email profileImage')
    .populate('booking', 'status bookingDate')
    .populate('offer', 'status proposedPrice')
    .populate('service', 'title');

  // Get unread counts for each chat
  const Message = mongoose.model('Message');
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      });

      const chatObj = chat.toObject();
      chatObj.unreadCount = unreadCount;
      return chatObj;
    })
  );

  const total = await this.countDocuments({
    participants: userId
  });

  return {
    data: chatsWithUnread,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export default mongoose.model('Chat', chatSchema);
