import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  // Service being offered on
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },

  // Parties involved
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Pricing
  proposedPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },

  counterPrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },

  // Offer details
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Validity
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'expired', 'withdrawn'],
    default: 'pending',
    index: true
  },

  // Negotiation history
  negotiationHistory: [{
    type: {
      type: String,
      enum: ['offer', 'counter', 'accept', 'reject', 'withdraw']
    },
    price: Number,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String
  }],

  // Linked booking (created when offer accepted)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
offerSchema.index({ customer: 1, status: 1 });
offerSchema.index({ provider: 1, status: 1 });
offerSchema.index({ service: 1, status: 1 });
offerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
offerSchema.index({ createdAt: -1 });

// Virtual for offer age
offerSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60)); // hours
});

// Pre-save: Add to negotiation history
offerSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isModified('counterPrice')) {
    const historyEntry = {
      type: this.status === 'countered' ? 'counter' : this.status,
      price: this.counterPrice || this.proposedPrice,
      by: this.status === 'countered' ? this.provider : this.customer,
      timestamp: new Date()
    };
    
    this.negotiationHistory.push(historyEntry);
  }
  next();
});

// Method: Create offer
offerSchema.statics.createOffer = async function(serviceId, customer, provider, proposedPrice, description) {
  const offer = await this.create({
    service: serviceId,
    customer,
    provider,
    proposedPrice,
    description,
    negotiationHistory: [{
      type: 'offer',
      price: proposedPrice,
      by: customer,
      timestamp: new Date(),
      message: description
    }]
  });
  
  return offer;
};

// Method: Counter offer
offerSchema.methods.counter = async function(counterPrice, provider, message) {
  if (this.status !== 'pending' && this.status !== 'countered') {
    throw new Error('Cannot counter this offer');
  }
  
  this.counterPrice = counterPrice;
  this.status = 'countered';
  this.negotiationHistory.push({
    type: 'counter',
    price: counterPrice,
    by: provider,
    timestamp: new Date(),
    message
  });
  
  await this.save();
  return this;
};

// Method: Accept offer
offerSchema.methods.accept = async function(user) {
  if (this.status === 'accepted') {
    throw new Error('Offer already accepted');
  }
  
  if (this.status === 'countered' && user.toString() !== this.customer.toString()) {
    throw new Error('Only customer can accept counter offer');
  }
  
  if (this.status === 'pending' && user.toString() !== this.provider.toString()) {
    throw new Error('Only provider can accept initial offer');
  }
  
  this.status = 'accepted';
  await this.save();
  return this;
};

// Method: Reject offer
offerSchema.methods.reject = async function(user) {
  if (this.status !== 'pending' && this.status !== 'countered') {
    throw new Error('Cannot reject this offer');
  }
  
  this.status = 'rejected';
  this.negotiationHistory.push({
    type: 'reject',
    by: user,
    timestamp: new Date()
  });
  
  await this.save();
  return this;
};

// Method: Withdraw offer
offerSchema.methods.withdraw = async function(user) {
  if (user.toString() !== this.customer.toString()) {
    throw new Error('Only customer can withdraw offer');
  }
  
  if (this.status !== 'pending' && this.status !== 'countered') {
    throw new Error('Cannot withdraw this offer');
  }
  
  this.status = 'withdrawn';
  this.negotiationHistory.push({
    type: 'withdraw',
    by: user,
    timestamp: new Date()
  });
  
  await this.save();
  return this;
};

// Static: Get active offers
offerSchema.statics.getActiveOffers = async function(userId) {
  return await this.find({
    $or: [{ customer: userId }, { provider: userId }],
    status: { $in: ['pending', 'countered'] },
    expiresAt: { $gt: new Date() }
  }).populate('service customer provider');
};

// Static: Get offer statistics
offerSchema.statics.getStatistics = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [{ customer: new mongoose.Types.ObjectId(userId) }, { provider: new mongoose.Types.ObjectId(userId) }]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$proposedPrice' }
      }
    }
  ]);
  
  const result = { total: 0, byStatus: {} };
  stats.forEach(stat => {
    result.byStatus[stat._id] = { count: stat.count, totalValue: stat.totalValue };
    result.total += stat.count;
  });
  
  return result;
};

export default mongoose.model('Offer', offerSchema);
