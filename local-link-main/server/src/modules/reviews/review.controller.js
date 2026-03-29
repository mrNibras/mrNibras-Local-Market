import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as reviewService from './review.service.js';
import { paginationValidator } from '../../shared/utils/validators.js';
import logger from '../../shared/utils/logger.js';

/**
 * Review Controller
 * Handles HTTP requests for review operations
 */

/**
 * Create a new review
 * POST /api/reviews
 */
export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.body, req.user.id);

  logger.info(`Review created: ${review._id}`);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review
  });
});

/**
 * Get all reviews (Admin only)
 * GET /api/reviews
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getAllReviews(req.query);

  res.status(200).json({
    success: true,
    ...reviews
  });
});

/**
 * Get review by ID
 * GET /api/reviews/:id
 */
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id);

  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * Get reviews for a service
 * GET /api/reviews/service/:serviceId
 */
export const getServiceReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getServiceReviews(req.params.serviceId, req.query);

  res.status(200).json({
    success: true,
    ...reviews
  });
});

/**
 * Get reviews by user
 * GET /api/reviews/user/:userId
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getUserReviews(req.params.userId, req.query);

  res.status(200).json({
    success: true,
    ...reviews
  });
});

/**
 * Get reviews for a provider
 * GET /api/reviews/provider/:providerId
 */
export const getProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProviderReviews(req.params.providerId, req.query);

  res.status(200).json({
    success: true,
    ...reviews
  });
});

/**
 * Update review
 * PATCH /api/reviews/:id
 */
export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

/**
 * Delete review
 * DELETE /api/reviews/:id
 */
export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
export const markHelpful = asyncHandler(async (req, res) => {
  await reviewService.markHelpful(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful'
  });
});

/**
 * Unmark review as helpful
 * DELETE /api/reviews/:id/helpful
 */
export const unmarkHelpful = asyncHandler(async (req, res) => {
  await reviewService.unmarkHelpful(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Review unmarked as helpful'
  });
});

/**
 * Add provider response to review
 * POST /api/reviews/:id/response
 */
export const addProviderResponse = asyncHandler(async (req, res) => {
  const { response } = req.body;
  
  const review = await reviewService.addProviderResponse(
    req.params.id,
    response,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    data: review
  });
});

/**
 * Get review statistics for a service
 * GET /api/reviews/service/:serviceId/stats
 */
export const getServiceStats = asyncHandler(async (req, res) => {
  const stats = await reviewService.getServiceStats(req.params.serviceId);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Get my reviews
 * GET /api/reviews/my-reviews
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getMyReviews(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...reviews
  });
});
