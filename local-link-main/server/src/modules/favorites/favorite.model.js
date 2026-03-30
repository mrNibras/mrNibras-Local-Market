import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },

  note: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },

  // For organizing favorites
  collection: {
    type: String,
    default: 'default',
    index: true
  }
}, {
  timestamps: true
});

// Prevent duplicate favorites
favoriteSchema.index({ user: 1, service: 1 }, { unique: true });

// Static: Add to favorites
favoriteSchema.statics.addToFavorites = async function(userId, serviceId, collection = 'default') {
  const favorite = await this.findOneAndUpdate(
    { user: userId, service: serviceId },
    { collection },
    { upsert: true, new: true }
  ).populate('service');
  
  return favorite;
};

// Static: Get user favorites
favoriteSchema.statics.getUserFavorites = async function(userId, collection) {
  const filter = { user: userId };
  if (collection) filter.collection = collection;
  
  return await this.find(filter)
    .populate('service', 'title category price averageRating location')
    .sort('-createdAt');
};

// Static: Get collections
favoriteSchema.statics.getCollections = async function(userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$collection',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model('Favorite', favoriteSchema);
