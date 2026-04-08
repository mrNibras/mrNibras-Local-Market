import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as bookingService from './booking.service.js';
import * as telegramService from '../../shared/utils/telegram.js';
import * as emailNotifications from '../../shared/utils/email-notifications.js';
import { paginationValidator } from '../../shared/utils/validators.js';
import logger from '../../shared/utils/logger.js';

/**
 * Booking Controller
 * Handles HTTP requests for booking operations
 */

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user.id);

  logger.info(`Booking created: ${booking._id}`);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking
  });
});

/**
 * Get all bookings (Admin only)
 * GET /api/bookings
 */
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings(req.query);

  res.status(200).json({
    success: true,
    ...bookings
  });
});

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);

  res.status(200).json({
    success: true,
    data: booking
  });
});

/**
 * Get my bookings (Customer)
 * GET /api/bookings/my-bookings
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getCustomerBookings(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...bookings
  });
});

/**
 * Get provider bookings
 * GET /api/bookings/provider/my-bookings
 */
export const getProviderBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getProviderBookings(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...bookings
  });
});

/**
 * Accept booking (Provider)
 * PATCH /api/bookings/:id/accept
 */
export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.acceptBooking(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Booking accepted successfully',
    data: booking
  });
});

/**
 * Reject booking (Provider)
 * PATCH /api/bookings/:id/reject
 */
export const rejectBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await bookingService.rejectBooking(req.params.id, req.user.id, reason);

  res.status(200).json({
    success: true,
    message: 'Booking rejected successfully',
    data: booking
  });
});

/**
 * Cancel booking (Customer or Provider)
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id, reason);

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});

/**
 * Complete booking (Provider)
 * PATCH /api/bookings/:id/complete
 */
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Booking completed successfully',
    data: booking
  });
});

/**
 * Update booking notes
 * PATCH /api/bookings/:id/notes
 */
export const updateBookingNotes = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingNotes(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: 'Notes updated successfully',
    data: booking
  });
});

/**
 * Get upcoming bookings
 * GET /api/bookings/upcoming
 */
export const getUpcomingBookings = asyncHandler(async (req, res) => {
  const role = req.user.role === 'provider' ? 'provider' : 'customer';
  const bookings = await bookingService.getUpcomingBookings(req.user.id, role);

  res.status(200).json({
    success: true,
    ...bookings
  });
});

/**
 * Get past bookings
 * GET /api/bookings/past
 */
export const getPastBookings = asyncHandler(async (req, res) => {
  const role = req.user.role === 'provider' ? 'provider' : 'customer';
  const bookings = await bookingService.getPastBookings(req.user.id, role);

  res.status(200).json({
    success: true,
    ...bookings
  });
});

/**
 * Get provider booking statistics
 * GET /api/bookings/stats
 */
export const getProviderStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({
      success: false,
      message: 'Only providers can access booking statistics',
      errorCode: 'PROVIDER_REQUIRED'
    });
  }

  const stats = await bookingService.getProviderStats(req.user.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Get bookings by date range (Provider)
 * GET /api/bookings/date-range
 */
export const getBookingsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const bookings = await bookingService.getBookingsByDateRange(
    req.user.id,
    new Date(startDate),
    new Date(endDate)
  );

  res.status(200).json({
    success: true,
    ...bookings
  });
});
