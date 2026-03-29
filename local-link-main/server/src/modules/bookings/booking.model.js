import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },

  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required'],
    index: true
  },

  endTime: {
    type: Date
  },

  duration: {
    type: Number, // minutes
    default: 60,
    min: [15, 'Minimum booking duration is 15 minutes'],
    max: [480, 'Maximum booking duration is 8 hours']
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  note: {
    type: String,
    maxlength: [1000, 'Note cannot exceed 1000 characters']
  },

  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  customerNotes: {
    type: String,
    maxlength: [1000, 'Customer notes cannot exceed 1000 characters']
  },

  providerNotes: {
    type: String,
    maxlength: [1000, 'Provider notes cannot exceed 1000 characters']
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },

  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    instructions: String
  },

  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },

  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  completedAt: {
    type: Date
  },

  cancelledAt: {
    type: Date
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },

  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ customer: 1 });
bookingSchema.index({ provider: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });

// Virtual for reviews
bookingSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'booking',
  justOne: true
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Set timestamps for status changes
  if (this.isModified('status')) {
    if (this.status === 'completed') {
      this.completedAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }
  next();
});

// Static method to check for double booking
bookingSchema.statics.checkDoubleBooking = async function(providerId, bookingDate) {
  const existingBooking = await this.findOne({
    provider: providerId,
    bookingDate: bookingDate,
    status: { $in: ['pending', 'accepted'] }
  });

  return !existingBooking; // Returns true if no conflict
};

// Method to check if booking can be modified
bookingSchema.methods.canBeModified = function() {
  return ['pending', 'accepted'].includes(this.status);
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return ['pending', 'accepted'].includes(this.status);
};

// Method to check if booking can be completed
bookingSchema.methods.canBeCompleted = function() {
  return this.status === 'accepted';
};

export default mongoose.model('Booking', bookingSchema);
