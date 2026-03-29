import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true
  },

  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    index: true
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },

  images: [{
    type: String,
    trim: true
  }],

  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },

  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  duration: {
    type: String,
    trim: true
  },

  serviceType: {
    type: String,
    enum: ['in-person', 'online', 'both'],
    default: 'in-person'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceSchema.index({ provider: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ price: 1 });
serviceSchema.index({ averageRating: -1 });
serviceSchema.index({ createdAt: -1 });

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'service',
  localField: '_id'
});

// Virtual for bookings
serviceSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'service',
  localField: '_id'
});

// Index for text search
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to ensure provider is a service provider
serviceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const provider = await User.findById(this.provider);
    
    if (!provider) {
      throw new Error('Provider not found');
    }
    
    // Update provider role if not already set
    if (provider.role !== 'provider' && provider.role !== 'admin') {
      provider.role = 'provider';
      await provider.save();
    }
  }
  next();
});

// Method to update rating
serviceSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { service: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        totalRatings: { $sum: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalReviews = stats[0].totalReviews;
    this.totalRatings = stats[0].totalRatings;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
    this.totalRatings = 0;
  }

  await this.save();
};

// Static method to find services near location
serviceSchema.statics.findNearLocation = function(coordinates, maxDistance = 5000, filter = {}) {
  return this.find({
    ...filter,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

export default mongoose.model('Service', serviceSchema);
