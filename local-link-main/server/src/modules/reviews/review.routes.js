import express from 'express';
import * as reviewController from './review.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import {
  createReviewValidator,
  updateReviewValidator,
  reviewIdParam,
  paginationValidator
} from '../../shared/utils/validators.js';

const router = express.Router();

// Public routes - anyone can view reviews
router.get('/service/:serviceId', paginationValidator, reviewController.getServiceReviews);
router.get('/service/:serviceId/stats', reviewController.getServiceStats);
router.get('/provider/:providerId', paginationValidator, reviewController.getProviderReviews);
router.get('/user/:userId', paginationValidator, reviewController.getUserReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes - require authentication
router.use(protect);

// Get all reviews (Admin only)
router.get('/', restrictTo('admin'), paginationValidator, reviewController.getAllReviews);

// Get my reviews
router.get('/my-reviews', paginationValidator, reviewController.getMyReviews);

// Create review (Customer only)
router.post('/', restrictTo('customer', 'admin'), createReviewValidator, reviewController.createReview);

// Update, delete review (Owner or Admin)
router
  .route('/:id')
  .patch(restrictTo('customer', 'admin'), updateReviewValidator, reviewController.updateReview)
  .delete(restrictTo('customer', 'admin'), reviewController.deleteReview);

// Mark/unmark as helpful
router.post('/:id/helpful', reviewIdParam, reviewController.markHelpful);
router.delete('/:id/helpful', reviewIdParam, reviewController.unmarkHelpful);

// Provider response to review
router.post('/:id/response', restrictTo('provider', 'admin'), reviewIdParam, reviewController.addProviderResponse);

export default router;
