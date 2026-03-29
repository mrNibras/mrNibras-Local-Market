import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as availabilityService from './availability.service.js';
import logger from '../../shared/utils/logger.js';

/**
 * Availability Controller
 * Handles HTTP requests for availability operations
 */

/**
 * Create availability
 * POST /api/availability
 */
export const createAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.createAvailability(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Availability created successfully',
    data: availability
  });
});

/**
 * Get all availability for current provider
 * GET /api/availability/my-availability
 */
export const getMyAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.getProviderAvailability(req.user.id);

  res.status(200).json({
    success: true,
    ...availability
  });
});

/**
 * Get availability by ID
 * GET /api/availability/:id
 */
export const getAvailabilityById = asyncHandler(async (req, res) => {
  const availability = await availabilityService.getAvailabilityById(req.params.id);

  res.status(200).json({
    success: true,
    data: availability
  });
});

/**
 * Get availability for a specific day
 * GET /api/availability/day/:dayOfWeek
 */
export const getDayAvailability = asyncHandler(async (req, res) => {
  const dayOfWeek = parseInt(req.params.dayOfWeek);
  const availability = await availabilityService.getDayAvailability(req.user.id, dayOfWeek);

  res.status(200).json({
    success: true,
    data: availability
  });
});

/**
 * Get available slots for a day
 * GET /api/availability/day/:dayOfWeek/slots
 */
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const dayOfWeek = parseInt(req.params.dayOfWeek);
  const slots = await availabilityService.getAvailableSlots(req.user.id, dayOfWeek);

  res.status(200).json({
    success: true,
    ...slots
  });
});

/**
 * Update availability
 * PATCH /api/availability/:id
 */
export const updateAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.updateAvailability(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Availability updated successfully',
    data: availability
  });
});

/**
 * Delete availability
 * DELETE /api/availability/:id
 */
export const deleteAvailability = asyncHandler(async (req, res) => {
  await availabilityService.deleteAvailability(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Availability deleted successfully'
  });
});

/**
 * Set exception availability
 * POST /api/availability/exception
 */
export const setException = asyncHandler(async (req, res) => {
  const exception = await availabilityService.setException(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Exception availability created successfully',
    data: exception
  });
});

/**
 * Get exceptions for a date range
 * GET /api/availability/exceptions
 */
export const getExceptions = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const exceptions = await availabilityService.getExceptions(
    req.user.id,
    new Date(startDate),
    new Date(endDate)
  );

  res.status(200).json({
    success: true,
    ...exceptions
  });
});

/**
 * Check slot availability
 * GET /api/availability/check-slot
 */
export const checkSlotAvailability = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.query;

  if (!dayOfWeek || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Day of week, start time, and end time are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const result = await availabilityService.checkSlotAvailability(
    req.user.id,
    parseInt(dayOfWeek),
    startTime,
    endTime
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Book a slot
 * POST /api/availability/:id/book
 */
export const bookSlot = asyncHandler(async (req, res) => {
  const { startTime, endTime, bookingId } = req.body;

  if (!startTime || !endTime || !bookingId) {
    return res.status(400).json({
      success: false,
      message: 'Start time, end time, and booking ID are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const availability = await availabilityService.bookSlot(
    req.params.id,
    startTime,
    endTime,
    bookingId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Slot booked successfully',
    data: availability
  });
});

/**
 * Cancel a slot
 * POST /api/availability/:id/cancel-slot
 */
export const cancelSlot = asyncHandler(async (req, res) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Start time and end time are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const availability = await availabilityService.cancelSlot(
    req.params.id,
    startTime,
    endTime,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Slot cancelled successfully',
    data: availability
  });
});

/**
 * Toggle availability active status
 * PATCH /api/availability/:id/toggle-active
 */
export const toggleActive = asyncHandler(async (req, res) => {
  const availability = await availabilityService.toggleActive(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: `Availability ${availability.isActive ? 'activated' : 'deactivated'} successfully`,
    data: availability
  });
});

/**
 * Delete all availability for current provider
 * DELETE /api/availability/all
 */
export const deleteAllAvailability = asyncHandler(async (req, res) => {
  await availabilityService.deleteAllAvailability(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All availability deleted successfully'
  });
});
