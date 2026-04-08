import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return password in queries by default
  },

  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
    index: true
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{8,}$/, 'Please provide a valid phone number']
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [-73.935242, 40.730610], // Default to NYC
      index: '2dsphere'
    }
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  profileImage: {
    type: String,
    default: ''
  },

  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  // For providers only
  providerInfo: {
    company: String,
    license: String,
    yearsOfExperience: Number,
    specialties: [String],
    bio: String,
    portfolio: [{
      title: String,
      description: String,
      images: [String],
      completedAt: Date
    }],
    certifications: [{
      name: String,
      issuer: String,
      issuedAt: Date,
      certificateUrl: String
    }],
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },

  // Trust Score (calculated)
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Response time tracking (in minutes)
  avgResponseTime: {
    type: Number,
    default: 0
  },

  // Statistics
  stats: {
    totalJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    cancelledJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },

  // Badges
  badges: [{
    type: String,
    enum: ['top_rated', 'rising_talent', 'fast_responder', 'verified', 'super_provider']
  }],

  // Telegram integration
  telegramChatId: {
    type: String,
    sparse: true
  },

  telegramUsername: {
    type: String
  },

  // Refresh token for session management
  refreshToken: {
    type: String,
    select: false
  },

  // Token expiry tracking
  refreshTokenExpiresAt: {
    type: Date,
    select: false
  },

  // Password reset fields
  passwordResetCode: {
    type: String,
    select: false
  },

  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ createdAt: -1 });

// Virtual for user's services
userSchema.virtual('services', {
  ref: 'Service',
  foreignField: 'provider',
  localField: '_id'
});

// Virtual for user's bookings (as customer)
userSchema.virtual('bookingsAsCustomer', {
  ref: 'Booking',
  foreignField: 'customer',
  localField: '_id'
});

// Virtual for user's bookings (as provider)
userSchema.virtual('bookingsAsProvider', {
  ref: 'Booking',
  foreignField: 'provider',
  localField: '_id'
});

// Pre-save middleware to handle provider role
userSchema.pre('save', function(next) {
  // If role is provider and providerInfo doesn't exist, initialize it
  if (this.role === 'provider' && !this.providerInfo) {
    this.providerInfo = {};
  }
  next();
});

// Method to hide sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
