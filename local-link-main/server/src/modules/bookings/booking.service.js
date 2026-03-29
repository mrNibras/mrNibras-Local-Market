import * as bookingRepository from './booking.repository.js';
import * as serviceRepository from '../services/service.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Booking Service
 * Contains business logic for booking operations
 */

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>}
 */
export const createBooking = async (bookingData, customerId) => {
  const { provider, service: serviceId, bookingDate } = bookingData;

  // Verify service exists and get details
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  // Verify provider matches service provider
  if (service.provider.toString() !== provider) {
    throw new BadRequestError('Provider does not match service provider', 'PROVIDER_MISMATCH');
  }

  // Check for double booking
  const isAvailable = await bookingRepository.checkDoubleBooking(provider, bookingDate);
  if (!isAvailable) {
    throw new ConflictError('Time slot already booked', 'SLOT_UNAVAILABLE');
  }

  // Create booking
  const booking = await bookingRepository.createBooking({
    ...bookingData,
    customer: customerId,
    price: service.price
  });

  // Populate booking with related data
  const populatedBooking = await bookingRepository.findById(booking._id, {
    populate: [
      { path: 'customer', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'title category price' }
    ]
  });

  logger.info(`Booking created: ${booking._id} by customer ${customerId}`);

  return populatedBooking;
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
export const getBookingById = async (bookingId) => {
  const booking = await bookingRepository.findById(bookingId, {
    populate: [
      { path: 'customer', select: 'name email phone profileImage' },
      { path: 'provider', select: 'name email phone profileImage' },
      { path: 'service', select: 'title category price description' }
    ]
  });

  if (!booking) {
    throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
  }

  return booking;
};

/**
 * Get all bookings (Admin only)
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getAllBookings = async (queryParams) => {
  const { status, customer, provider, page, limit, sort } = queryParams;

  const filter = {};
  if (status) filter.status = status;
  if (customer) filter.customer = customer;
  if (provider) filter.provider = provider;

  const result = await bookingRepository.findAll(filter, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-bookingDate',
    populate: [
      { path: 'customer', select: 'name email' },
      { path: 'provider', select: 'name email' },
      { path: 'service', select: 'title' }
    ]
  });

  return result;
};

/**
 * Get customer's bookings
 * @param {string} customerId - Customer ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getCustomerBookings = async (customerId, queryParams) => {
  const { status, page, limit, sort } = queryParams;

  const result = await bookingRepository.findByCustomer(customerId, {
    status,
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-bookingDate'
  });

  return result;
};

/**
 * Get provider's bookings
 * @param {string} providerId - Provider ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getProviderBookings = async (providerId, queryParams) => {
  const { status, page, limit, sort } = queryParams;

  const result = await bookingRepository.findByProvider(providerId, {
    status,
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-bookingDate'
  });

  return result;
};

/**
 * Accept booking (Provider only)
 * @param {string} bookingId - Booking ID
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const acceptBooking = async (bookingId, providerId) => {
  const booking = await getBookingById(bookingId);

  // Verify provider owns this booking
  if (booking.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only manage your own bookings', 'NOT_AUTHORIZED');
  }

  // Check if booking can be accepted
  if (booking.status !== 'pending') {
    throw new BadRequestError(`Cannot accept booking with status: ${booking.status}`, 'INVALID_STATUS');
  }

  const updatedBooking = await bookingRepository.acceptBooking(bookingId);

  logger.info(`Booking accepted: ${bookingId} by provider ${providerId}`);

  return updatedBooking;
};

/**
 * Reject booking (Provider only)
 * @param {string} bookingId - Booking ID
 * @param {string} providerId - Provider ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>}
 */
export const rejectBooking = async (bookingId, providerId, reason = null) => {
  const booking = await getBookingById(bookingId);

  // Verify provider owns this booking
  if (booking.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only manage your own bookings', 'NOT_AUTHORIZED');
  }

  // Check if booking can be rejected
  if (booking.status !== 'pending') {
    throw new BadRequestError(`Cannot reject booking with status: ${booking.status}`, 'INVALID_STATUS');
  }

  const updatedBooking = await bookingRepository.rejectBooking(bookingId, reason);

  logger.info(`Booking rejected: ${bookingId} by provider ${providerId}`);

  return updatedBooking;
};

/**
 * Cancel booking (Customer or Provider)
 * @param {string} bookingId - Booking ID
 * @param {string} userId - User ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (bookingId, userId, reason = null) => {
  const booking = await getBookingById(bookingId);

  // Verify user is customer or provider
  const isCustomer = booking.customer._id.toString() === userId;
  const isProvider = booking.provider._id.toString() === userId;

  if (!isCustomer && !isProvider) {
    throw new ForbiddenError('You can only cancel your own bookings', 'NOT_AUTHORIZED');
  }

  // Check if booking can be cancelled
  if (!booking.canBeCancelled()) {
    throw new BadRequestError(`Cannot cancel booking with status: ${booking.status}`, 'INVALID_STATUS');
  }

  const updatedBooking = await bookingRepository.cancelBooking(bookingId, reason);

  logger.info(`Booking cancelled: ${bookingId} by user ${userId}`);

  return updatedBooking;
};

/**
 * Complete booking (Provider only)
 * @param {string} bookingId - Booking ID
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const completeBooking = async (bookingId, providerId) => {
  const booking = await getBookingById(bookingId);

  // Verify provider owns this booking
  if (booking.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only manage your own bookings', 'NOT_AUTHORIZED');
  }

  // Check if booking can be completed
  if (!booking.canBeCompleted()) {
    throw new BadRequestError(`Cannot complete booking with status: ${booking.status}`, 'INVALID_STATUS');
  }

  const updatedBooking = await bookingRepository.completeBooking(bookingId);

  logger.info(`Booking completed: ${bookingId} by provider ${providerId}`);

  return updatedBooking;
};

/**
 * Update booking notes
 * @param {string} bookingId - Booking ID
 * @param {Object} updateData - Notes data
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>}
 */
export const updateBookingNotes = async (bookingId, updateData, userId, role) => {
  const booking = await getBookingById(bookingId);

  const updateFields = {};

  if (role === 'customer' && updateData.customerNotes !== undefined) {
    if (booking.customer._id.toString() !== userId) {
      throw new ForbiddenError('You can only update your own notes', 'NOT_AUTHORIZED');
    }
    updateFields.customerNotes = updateData.customerNotes;
  } else if (role === 'provider' && updateData.providerNotes !== undefined) {
    if (booking.provider._id.toString() !== userId) {
      throw new ForbiddenError('You can only update your own notes', 'NOT_AUTHORIZED');
    }
    updateFields.providerNotes = updateData.providerNotes;
  } else if (role === 'admin') {
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
    if (updateData.customerNotes !== undefined) updateFields.customerNotes = updateData.customerNotes;
    if (updateData.providerNotes !== undefined) updateFields.providerNotes = updateData.providerNotes;
  } else {
    throw new ForbiddenError('Not authorized to update notes', 'NOT_AUTHORIZED');
  }

  const updatedBooking = await bookingRepository.updateById(bookingId, updateFields);

  logger.info(`Booking notes updated: ${bookingId}`);

  return updatedBooking;
};

/**
 * Get booking statistics for provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const getProviderStats = async (providerId) => {
  return await bookingRepository.getStats(providerId);
};

/**
 * Get upcoming bookings for user
 * @param {string} userId - User ID
 * @param {string} role - User role (customer or provider)
 * @returns {Promise<Object>}
 */
export const getUpcomingBookings = async (userId, role) => {
  const bookings = await bookingRepository.findUpcoming(userId, role);

  return {
    count: bookings.length,
    data: bookings
  };
};

/**
 * Get past bookings for user
 * @param {string} userId - User ID
 * @param {string} role - User role (customer or provider)
 * @returns {Promise<Object>}
 */
export const getPastBookings = async (userId, role) => {
  const bookings = await bookingRepository.findPast(userId, role);

  return {
    count: bookings.length,
    data: bookings
  };
};

/**
 * Get bookings by date range for provider
 * @param {string} providerId - Provider ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
export const getBookingsByDateRange = async (providerId, startDate, endDate) => {
  const bookings = await bookingRepository.findByDateRange(providerId, startDate, endDate);

  return {
    count: bookings.length,
    data: bookings
  };
};
