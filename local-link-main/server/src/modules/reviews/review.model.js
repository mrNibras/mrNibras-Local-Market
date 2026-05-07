import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required'],
    index: true
  },

  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },

  // Multi-metric ratings
  metrics: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Would recommend?
  wouldRecommend: {
    type: Boolean,
    default: true
  },

  comment: {
    type: String,
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  images: [{
    type: String,
    trim: true
  }],

  response: {
    type: String,
    maxlength: [500, 'Response cannot exceed 500 characters']
  },

  responseDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ service: 1, rating: 1 });

// Virtual for user info
reviewSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Compound index to prevent duplicate reviews from same user for same service
reviewSchema.index({ user: 1, service: 1 }, { unique: true, sparse: true });

// Pre-save middleware to set provider and verify booking
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Service = mongoose.model('Service');
    const Booking = mongoose.model('Booking');

    // Get service to find provider
    const service = await Service.findById(this.service);
    if (service) {
      this.provider = service.provider;
    }

    // Verify booking if provided
    if (this.booking) {
      const booking = await Booking.findById(this.booking);
      if (booking) {
        // Verify the user is the customer from the booking
        if (booking.customer.toString() !== this.user.toString()) {
          throw new Error('Only the customer from the booking can review this service');
        }
        // Verify booking is completed
        if (booking.status !== 'completed') {
          throw new Error('Can only review completed bookings');
        }
        this.isVerified = true;
      }
    }
  }
  next();
});

// Post-save middleware to update service rating
reviewSchema.post('save', async function() {
  const Service = mongoose.model('Service');
  const service = await Service.findById(this.service);
  if (service) {
    await service.updateRating();
  }
});

// Post-remove middleware to update service rating when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Service = mongoose.model('Service');
    const service = await Service.findById(doc.service);
    if (service) {
      await service.updateRating();
    }
  }
});

// Static method to get service reviews with stats
reviewSchema.statics.getServiceReviews = async function(serviceId, options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  const [reviews, total, stats] = await Promise.all([
    this.find({ service: serviceId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profileImage'),
    this.countDocuments({ service: serviceId }),
    this.aggregate([
      { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ])
  ]);

  const ratingDistribution = {};
  if (stats.length > 0) {
    stats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });
  }

  return {
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    stats: stats.length > 0 ? {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution
    } : null
  };
};

export default mongoose.model('Review', reviewSchema);
