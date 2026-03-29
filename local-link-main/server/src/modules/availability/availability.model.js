import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true
  },

  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: [0, 'Day must be 0-6'],
    max: [6, 'Day must be 0-6'],
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  },

  slots: [{
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format']
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],

  isActive: {
    type: Boolean,
    default: true
  },

  // For exceptional dates (holidays, vacations)
  date: {
    type: Date
  },

  // Override regular availability for specific date
  isException: {
    type: Boolean,
    default: false
  },

  exceptionReason: {
    type: String,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
availabilitySchema.index({ provider: 1, dayOfWeek: 1 });
availabilitySchema.index({ provider: 1, date: 1 });
availabilitySchema.index({ provider: 1, isActive: 1 });

// Compound index to prevent duplicate day entries for same provider
availabilitySchema.index({ provider: 1, dayOfWeek: 1, date: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { isException: true }
});

// Pre-save validation
availabilitySchema.pre('save', function(next) {
  // Validate that end time is after start time for each slot
  if (this.slots && this.slots.length > 0) {
    for (const slot of this.slots) {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        throw new Error(`End time must be after start time for slot ${slot.startTime}-${slot.endTime}`);
      }
    }
  }
  next();
});

// Static method to get availability by day
availabilitySchema.statics.getByDayOfWeek = async function(providerId, dayOfWeek) {
  return await this.findOne({
    provider: providerId,
    dayOfWeek,
    isException: false,
    isActive: true
  }).populate('provider', 'name email');
};

// Static method to get all availability for a provider
availabilitySchema.statics.getProviderAvailability = async function(providerId) {
  return await this.find({
    provider: providerId,
    isException: false,
    isActive: true
  }).sort('dayOfWeek');
};

// Static method to check if slot is available
availabilitySchema.statics.isSlotAvailable = async function(providerId, dayOfWeek, startTime, endTime) {
  const availability = await this.findOne({
    provider: providerId,
    dayOfWeek,
    isException: false,
    isActive: true
  });

  if (!availability) return false;

  const slot = availability.slots.find(s => 
    s.startTime === startTime && 
    s.endTime === endTime &&
    !s.isBooked
  );

  return !!slot;
};

// Method to check if time falls within any slot
availabilitySchema.methods.isTimeAvailable = function(time) {
  const [hour, minute] = time.split(':').map(Number);
  const timeInMinutes = hour * 60 + minute;

  for (const slot of this.slots) {
    if (slot.isBooked) continue;

    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);

    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;

    if (timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes) {
      return true;
    }
  }

  return false;
};

export default mongoose.model('Availability', availabilitySchema);
