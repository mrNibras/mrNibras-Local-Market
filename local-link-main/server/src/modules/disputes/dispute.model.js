import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  // Related entities
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },

  // Parties
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Dispute details
  reason: {
    type: String,
    required: true,
    enum: [
      'service_not_delivered',
      'poor_quality',
      'late_delivery',
      'overcharged',
      'misrepresentation',
      'rude_behavior',
      'other'
    ]
  },

  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Evidence
  evidence: [{
    type: String, // URL to image/document
    label: String
  }],

  // Status
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'rejected', 'escalated'],
    default: 'open',
    index: true
  },

  // Resolution
  resolution: {
    type: String,
    maxlength: [2000, 'Resolution cannot exceed 2000 characters']
  },

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin who resolved
  },

  resolvedAt: Date,

  // Outcome
  outcome: {
    type: String,
    enum: ['refund_full', 'refund_partial', 'no_refund', 'redo_service', 'other'],
  },

  refundAmount: {
    type: Number,
    min: [0, 'Refund cannot be negative']
  },

  // Timeline
  messages: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
disputeSchema.index({ booking: 1 });
disputeSchema.index({ raisedBy: 1 });
disputeSchema.index({ against: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });

// Static: Create dispute
disputeSchema.statics.createDispute = async function(data) {
  return await this.create(data);
};

// Static: Get disputes for user
disputeSchema.statics.getUserDisputes = async function(userId, role) {
  const filter = role === 'customer' ? { raisedBy: userId } : { against: userId };
  
  return await this.find(filter)
    .populate('booking', 'bookingDate status')
    .populate('service', 'title')
    .sort('-createdAt');
};

// Method: Add message
disputeSchema.methods.addMessage = async function(from, message) {
  this.messages.push({ from, message, timestamp: new Date() });
  await this.save();
  return this;
};

// Method: Update status
disputeSchema.methods.updateStatus = async function(status, resolvedBy = null) {
  this.status = status;
  if (resolvedBy) {
    this.resolvedBy = resolvedBy;
    this.resolvedAt = new Date();
  }
  await this.save();
  return this;
};

// Method: Resolve dispute
disputeSchema.methods.resolve = async function(resolution, outcome, refundAmount, resolvedBy) {
  this.resolution = resolution;
  this.outcome = outcome;
  this.refundAmount = refundAmount;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  this.status = 'resolved';
  await this.save();
  return this;
};

export default mongoose.model('Dispute', disputeSchema);
