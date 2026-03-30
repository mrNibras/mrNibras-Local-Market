import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification type
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'message', 'system', 'promotion'],
    required: true,
    index: true
  },

  // Notification content
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  // Additional data
  data: {
    type: Object,
    default: {}
  },

  // Related entities
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },

  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },

  readAt: Date,

  // Delivery channels
  channels: {
    email: {
      sent: Boolean,
      sentAt: Date,
      opened: Boolean,
      openedAt: Date
    },
    sms: {
      sent: Boolean,
      sentAt: Date
    },
    push: {
      sent: Boolean,
      sentAt: Date
    }
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Expiry (notifications auto-archive after this)
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save: Set default expiry (30 days)
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
  return this;
};

// Method to mark email as opened
notificationSchema.methods.markEmailOpened = async function() {
  this.channels.email.opened = true;
  this.channels.email.openedAt = new Date();
  await this.save();
  return this;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    user: userId,
    isRead: false
  });
};

// Static method to get notifications with pagination
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { page = 1, limit = 20, isRead } = options;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (isRead !== undefined) filter.isRead = isRead;

  const [notifications, total] = await Promise.all([
    this.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('booking', 'bookingDate status')
      .populate('service', 'title')
      .populate('payment', 'amount status'),
    this.countDocuments(filter)
  ]);

  return {
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export default mongoose.model('Notification', notificationSchema);
