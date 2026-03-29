import Review from './review.model.js';

/**
 * Review Repository
 * Handles all database operations for Review model
 */

/**
 * Create a new review
 * @param {Object} reviewData - Review data
 * @returns {Promise<Review>}
 */
export const createReview = async (reviewData) => {
  return await Review.create(reviewData);
};

/**
 * Find review by ID
 * @param {string} id - Review ID
 * @param {Object} options - Query options
 * @returns {Promise<Review|null>}
 */
export const findById = async (id, options = {}) => {
  const { select = '', populate = [] } = options;
  let query = Review.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);

  return await query;
};

/**
 * Find all reviews with filtering, pagination, and sorting
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findAll = async (filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    select = '',
    populate = []
  } = options;

  const skip = (page - 1) * limit;

  let query = Review.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (sort) query = query.sort(sort);

  const [reviews, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Review.countDocuments(filter)
  ]);

  return {
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Update review by ID
 * @param {string} id - Review ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<Review|null>}
 */
export const updateById = async (id, updateData, options = {}) => {
  const { newDoc = true, select = '' } = options;
  
  let query = Review.findByIdAndUpdate(id, updateData, { new: newDoc });
  if (select) query = query.select(select);

  return await query;
};

/**
 * Delete review by ID
 * @param {string} id - Review ID
 * @returns {Promise<Review|null>}
 */
export const deleteById = async (id) => {
  return await Review.findByIdAndDelete(id);
};

/**
 * Find reviews by service
 * @param {string} serviceId - Service ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByService = async (serviceId, options = {}) => {
  return await Review.getServiceReviews(serviceId, options);
};

/**
 * Find reviews by user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByUser = async (userId, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('service', 'title category'),
    Review.countDocuments({ user: userId })
  ]);

  return {
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Find reviews by provider
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByProvider = async (providerId, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ provider: providerId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('service user', 'title name'),
    Review.countDocuments({ provider: providerId })
  ]);

  return {
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Check if user has already reviewed a service
 * @param {string} userId - User ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<boolean>}
 */
export const hasReviewed = async (userId, serviceId) => {
  const review = await Review.findOne({ user: userId, service: serviceId });
  return !!review;
};

/**
 * Check if user can review based on completed booking
 * @param {string} userId - User ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<boolean>}
 */
export const canReview = async (userId, serviceId) => {
  const Booking = mongoose.model('Booking');
  
  const completedBooking = await Booking.findOne({
    customer: userId,
    service: serviceId,
    status: 'completed'
  });

  return !!completedBooking;
};

/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @returns {Promise<Review|null>}
 */
export const markHelpful = async (reviewId, userId) => {
  return await Review.findByIdAndUpdate(
    reviewId,
    { $addToSet: { helpful: userId } },
    { new: true }
  );
};

/**
 * Unmark review as helpful
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @returns {Promise<Review|null>}
 */
export const unmarkHelpful = async (reviewId, userId) => {
  return await Review.findByIdAndUpdate(
    reviewId,
    { $pull: { helpful: userId } },
    { new: true }
  );
};

/**
 * Add provider response to review
 * @param {string} reviewId - Review ID
 * @param {string} response - Response text
 * @returns {Promise<Review|null>}
 */
export const addResponse = async (reviewId, response) => {
  return await Review.findByIdAndUpdate(
    reviewId,
    {
      response,
      responseDate: new Date()
    },
    { new: true }
  );
};

/**
 * Get review statistics for a service
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const getServiceStats = async (serviceId) => {
  const stats = await Review.aggregate([
    { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        minRating: { $min: '$rating' },
        maxRating: { $max: '$rating' },
        verifiedReviews: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      minRating: 0,
      maxRating: 0,
      verifiedReviews: 0
    };
  }

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
    minRating: stats[0].minRating,
    maxRating: stats[0].maxRating,
    verifiedReviews: stats[0].verifiedReviews
  };
};

/**
 * Get rating distribution for a service
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const getRatingDistribution = async (serviceId) => {
  const distribution = await Review.aggregate([
    { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const result = {};
  distribution.forEach(item => {
    result[item._id] = item.count;
  });

  return result;
};

// Import mongoose for ObjectId
import mongoose from 'mongoose';
