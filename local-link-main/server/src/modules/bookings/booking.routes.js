import express from 'express';
import * as bookingController from './booking.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import {
  createBookingValidator,
  updateBookingStatusValidator,
  bookingIdParam,
  paginationValidator
} from '../../shared/utils/validators.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Customer routes
router.post('/', createBookingValidator, bookingController.createBooking);
router.get('/my-bookings', paginationValidator, bookingController.getMyBookings);
router.get('/upcoming', bookingController.getUpcomingBookings);
router.get('/past', bookingController.getPastBookings);

// Provider routes
router.get('/provider/my-bookings', restrictTo('provider', 'admin'), paginationValidator, bookingController.getProviderBookings);
router.get('/provider/stats', restrictTo('provider', 'admin'), bookingController.getProviderStats);
router.get('/provider/date-range', restrictTo('provider', 'admin'), bookingController.getBookingsByDateRange);

// Booking management routes (Provider actions)
router.patch('/:id/accept', restrictTo('provider', 'admin'), bookingIdParam, bookingController.acceptBooking);
router.patch('/:id/reject', restrictTo('provider', 'admin'), bookingIdParam, bookingController.rejectBooking);
router.patch('/:id/complete', restrictTo('provider', 'admin'), bookingIdParam, bookingController.completeBooking);

// Cancel booking (Customer or Provider)
router.patch('/:id/cancel', bookingIdParam, bookingController.cancelBooking);

// Update notes
router.patch('/:id/notes', bookingIdParam, bookingController.updateBookingNotes);

// Admin routes
router.get('/', restrictTo('admin'), paginationValidator, bookingController.getAllBookings);

// Get booking by ID (Customer, Provider, or Admin)
router.get('/:id', bookingIdParam, bookingController.getBookingById);

export default router;
