import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Booking reference
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },

  // Payment parties
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },

  // Payment details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },

  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },

  // Payment platform (Stripe)
  paymentMethod: {
    type: String,
    enum: ['stripe', 'cash', 'bank_transfer'],
    default: 'stripe'
  },

  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending',
    index: true
  },

  // Platform fee (your commission)
  platformFee: {
    type: Number,
    default: 0
  },

  // Provider earnings (amount - platform fee)
  providerEarnings: {
    type: Number,
    default: 0
  },

  // Refund information
  refundInfo: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    notes: String
  },

  // Stripe response data
  stripeData: {
    type: Object,
    select: false
  },

  // Receipt
  receiptUrl: String,
  receiptEmail: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ provider: 1, status: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for payment age
paymentSchema.virtual('paymentAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60)); // hours
});

// Pre-save: Calculate platform fee and provider earnings
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    // Default 10% platform fee
    this.platformFee = Math.round(this.amount * 0.1 * 100) / 100;
    this.providerEarnings = Math.round((this.amount - this.platformFee) * 100) / 100;
  }
  next();
});

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(providerId) {
  const stats = await this.aggregate([
    { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const result = {
    total: 0,
    totalRevenue: 0,
    byStatus: {}
  };

  stats.forEach(stat => {
    result.byStatus[stat._id] = {
      count: stat.count,
      amount: stat.totalAmount
    };
    result.total += stat.count;
    result.totalRevenue += stat.totalAmount;
  });

  return result;
};

// Method to mark as completed
paymentSchema.methods.complete = async function() {
  this.status = 'completed';
  await this.save();
  return this;
};

// Method to process refund
paymentSchema.methods.refund = async function(amount, reason, refundedBy) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }

  this.status = 'refunded';
  this.refundInfo = {
    amount: amount || this.amount,
    reason,
    refundedAt: new Date(),
    refundedBy
  };

  await this.save();
  return this;
};

export default mongoose.model('Payment', paymentSchema);
