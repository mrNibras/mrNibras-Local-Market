import * as reviewRepository from './review.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Review Service
 * Contains business logic for review operations
 */

/**
 * Create a new review
 * @param {Object} reviewData - Review data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const createReview = async (reviewData, userId) => {
  const { service } = reviewData;

  // Check if user has already reviewed this service
  const hasReviewed = await reviewRepository.hasReviewed(userId, service);
  if (hasReviewed) {
    throw new ConflictError('You have already reviewed this service', 'REVIEW_EXISTS');
  }

  // Check if user can review (has completed booking)
  const canReview = await reviewRepository.canReview(userId, service);
  if (!canReview) {
    throw new BadRequestError(
      'You can only review services after completing a booking',
      'CANNOT_REVIEW'
    );
  }

  // Create review
  const review = await reviewRepository.createReview({
    ...reviewData,
    user: userId
  });

  // Populate review with related data
  const populatedReview = await reviewRepository.findById(review._id, {
    populate: [
      { path: 'user', select: 'name profileImage' },
      { path: 'service', select: 'title category' }
    ]
  });

  logger.info(`Review created: ${review._id} by user ${userId}`);

  return populatedReview;
};

/**
 * Get review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>}
 */
export const getReviewById = async (reviewId) => {
  const review = await reviewRepository.findById(reviewId, {
    populate: [
      { path: 'user', select: 'name profileImage' },
      { path: 'service', select: 'title category' },
      { path: 'helpful', select: 'name' }
    ]
  });

  if (!review) {
    throw new NotFoundError('Review not found', 'REVIEW_NOT_FOUND');
  }

  return review;
};

/**
 * Get all reviews (Admin only)
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getAllReviews = async (queryParams) => {
  const { service, provider, user, rating, isVerified, page, limit, sort } = queryParams;

  const filter = {};
  if (service) filter.service = service;
  if (provider) filter.provider = provider;
  if (user) filter.user = user;
  if (rating) filter.rating = parseInt(rating);
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

  const result = await reviewRepository.findAll(filter, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-createdAt',
    populate: [
      { path: 'user', select: 'name profileImage' },
      { path: 'service', select: 'title' },
      { path: 'provider', select: 'name' }
    ]
  });

  return result;
};

/**
 * Get reviews for a service
 * @param {string} serviceId - Service ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getServiceReviews = async (serviceId, queryParams) => {
  const { page, limit, sort } = queryParams;

  const result = await reviewRepository.findByService(serviceId, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-createdAt'
  });

  return result;
};

/**
 * Get reviews by user
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getUserReviews = async (userId, queryParams) => {
  const { page, limit, sort } = queryParams;

  const result = await reviewRepository.findByUser(userId, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-createdAt'
  });

  return result;
};

/**
 * Get reviews for a provider
 * @param {string} providerId - Provider ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getProviderReviews = async (providerId, queryParams) => {
  const { page, limit, sort } = queryParams;

  const result = await reviewRepository.findByProvider(providerId, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-createdAt'
  });

  return result;
};

/**
 * Update review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const updateReview = async (reviewId, updateData, userId) => {
  const review = await getReviewById(reviewId);

  // Check if user owns the review
  if (review.user._id.toString() !== userId) {
    throw new ForbiddenError('You can only update your own reviews', 'NOT_AUTHORIZED');
  }

  const updatedReview = await reviewRepository.updateById(reviewId, updateData);

  logger.info(`Review updated: ${reviewId}`);

  return updatedReview;
};

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>}
 */
export const deleteReview = async (reviewId, userId, userRole) => {
  const review = await getReviewById(reviewId);

  // Check if user owns the review or is admin
  const isOwner = review.user._id.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('You can only delete your own reviews', 'NOT_AUTHORIZED');
  }

  await reviewRepository.deleteById(reviewId);

  logger.info(`Review deleted: ${reviewId} by user ${userId}`);

  return { message: 'Review deleted successfully' };
};

/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const markHelpful = async (reviewId, userId) => {
  const review = await getReviewById(reviewId);

  // User cannot mark their own review as helpful
  if (review.user._id.toString() === userId) {
    throw new BadRequestError('You cannot mark your own review as helpful', 'SELF_HELPFUL');
  }

  const updatedReview = await reviewRepository.markHelpful(reviewId, userId);

  return updatedReview;
};

/**
 * Unmark review as helpful
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const unmarkHelpful = async (reviewId, userId) => {
  const review = await getReviewById(reviewId);

  const updatedReview = await reviewRepository.unmarkHelpful(reviewId, userId);

  return updatedReview;
};

/**
 * Add provider response to review
 * @param {string} reviewId - Review ID
 * @param {string} response - Response text
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const addProviderResponse = async (reviewId, response, providerId) => {
  const review = await getReviewById(reviewId);

  // Check if user is the provider of the service
  if (review.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only respond to reviews for your services', 'NOT_AUTHORIZED');
  }

  const updatedReview = await reviewRepository.addResponse(reviewId, response);

  logger.info(`Provider response added to review: ${reviewId}`);

  return updatedReview;
};

/**
 * Get review statistics for a service
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const getServiceStats = async (serviceId) => {
  const stats = await reviewRepository.getServiceStats(serviceId);
  const distribution = await reviewRepository.getRatingDistribution(serviceId);

  return {
    ...stats,
    ratingDistribution: distribution
  };
};

/**
 * Get my reviews (authenticated user's reviews)
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getMyReviews = async (userId, queryParams) => {
  return await getUserReviews(userId, queryParams);
};
