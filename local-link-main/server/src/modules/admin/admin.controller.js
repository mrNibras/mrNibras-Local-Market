import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as adminService from './admin.service.js';
import logger from '../../shared/utils/logger.js';

/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Get recent activities
 * GET /api/admin/activities
 */
export const getActivities = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const activities = await adminService.getRecentActivities(parseInt(limit));

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
});

/**
 * Get system health
 * GET /api/admin/health
 */
export const getHealth = asyncHandler(async (req, res) => {
  const health = await adminService.getSystemHealth();

  res.status(200).json({
    success: true,
    data: health
  });
});

/**
 * Get pending bookings
 * GET /api/admin/pending-bookings
 */
export const getPendingBookings = asyncHandler(async (req, res) => {
  const bookings = await adminService.getPendingBookings();

  res.status(200).json({
    success: true,
    ...bookings
  });
});

/**
 * Get reported content
 * GET /api/admin/reports
 */
export const getReports = asyncHandler(async (req, res) => {
  const reports = await adminService.getReportedContent();

  res.status(200).json({
    success: true,
    ...reports
  });
});

/**
 * Get users by role
 * GET /api/admin/users/:role
 */
export const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { page, limit } = req.query;

  const users = await adminService.getUsersByRole(role, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  });

  res.status(200).json({
    success: true,
    ...users
  });
});

/**
 * Get services by category
 * GET /api/admin/services/category/:category
 */
export const getServicesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const services = await adminService.getServicesByCategory(category);

  res.status(200).json({
    success: true,
    ...services
  });
});

/**
 * Delete user (Admin)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Delete service (Admin)
 * DELETE /api/admin/services/:id
 */
export const deleteService = asyncHandler(async (req, res) => {
  await adminService.deleteService(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully'
  });
});

/**
 * Get analytics
 * GET /api/admin/analytics
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  const analytics = await adminService.getAnalytics(timeframe);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

/**
 * Get all bookings (Admin overview)
 * GET /api/admin/bookings
 */
export const getAllBookings = asyncHandler(async (req, res) => {
  const Booking = (await import('../bookings/booking.model.js')).default;
  
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('customer provider service', 'name email title'),
    Booking.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: bookings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get all reviews (Admin overview)
 * GET /api/admin/reviews
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  const Review = (await import('../reviews/review.model.js')).default;
  
  const { page = 1, limit = 20, rating } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (rating) filter.rating = parseInt(rating);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user service', 'name email title'),
    Review.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});
