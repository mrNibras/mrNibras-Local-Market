import * as availabilityRepository from './availability.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Availability Service
 * Contains business logic for availability operations
 */

/**
 * Create availability for a provider
 * @param {Object} availabilityData - Availability data
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const createAvailability = async (availabilityData, providerId) => {
  const { dayOfWeek, slots } = availabilityData;

  // Check if availability for this day already exists
  const existing = await availabilityRepository.findByDayOfWeek(providerId, dayOfWeek);
  if (existing) {
    throw new ConflictError('Availability for this day already exists', 'AVAILABILITY_EXISTS');
  }

  const availability = await availabilityRepository.createAvailability({
    ...availabilityData,
    provider: providerId
  });

  logger.info(`Availability created for provider ${providerId} on day ${dayOfWeek}`);

  return availability;
};

/**
 * Get availability by ID
 * @param {string} availabilityId - Availability ID
 * @returns {Promise<Object>}
 */
export const getAvailabilityById = async (availabilityId) => {
  const availability = await availabilityRepository.findById(availabilityId, {
    populate: { path: 'provider', select: 'name email' }
  });

  if (!availability) {
    throw new NotFoundError('Availability not found', 'AVAILABILITY_NOT_FOUND');
  }

  return availability;
};

/**
 * Get all availability for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const getProviderAvailability = async (providerId) => {
  const availability = await availabilityRepository.getProviderSchedule(providerId);

  return {
    count: availability.length,
    data: availability
  };
};

/**
 * Get availability for a specific day
 * @param {string} providerId - Provider ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {Promise<Object>}
 */
export const getDayAvailability = async (providerId, dayOfWeek) => {
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new BadRequestError('Day of week must be between 0 and 6', 'INVALID_DAY');
  }

  const availability = await availabilityRepository.findByDayOfWeek(providerId, dayOfWeek);

  if (!availability) {
    throw new NotFoundError('No availability set for this day', 'NO_AVAILABILITY');
  }

  return availability;
};

/**
 * Get available slots for a day
 * @param {string} providerId - Provider ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {Promise<Object>}
 */
export const getAvailableSlots = async (providerId, dayOfWeek) => {
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new BadRequestError('Day of week must be between 0 and 6', 'INVALID_DAY');
  }

  const slots = await availabilityRepository.getAvailableSlots(providerId, dayOfWeek);

  return {
    count: slots.length,
    data: slots
  };
};

/**
 * Update availability
 * @param {string} availabilityId - Availability ID
 * @param {Object} updateData - Data to update
 * @param {string} providerId - Provider ID (for authorization)
 * @returns {Promise<Object>}
 */
export const updateAvailability = async (availabilityId, updateData, providerId) => {
  const availability = await getAvailabilityById(availabilityId);

  // Check if user owns this availability
  if (availability.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only update your own availability', 'NOT_AUTHORIZED');
  }

  const updatedAvailability = await availabilityRepository.updateById(availabilityId, updateData);

  logger.info(`Availability updated: ${availabilityId}`);

  return updatedAvailability;
};

/**
 * Delete availability
 * @param {string} availabilityId - Availability ID
 * @param {string} providerId - Provider ID (for authorization)
 * @returns {Promise<Object>}
 */
export const deleteAvailability = async (availabilityId, providerId) => {
  const availability = await getAvailabilityById(availabilityId);

  // Check if user owns this availability
  if (availability.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only delete your own availability', 'NOT_AUTHORIZED');
  }

  await availabilityRepository.deleteById(availabilityId);

  logger.info(`Availability deleted: ${availabilityId}`);

  return { message: 'Availability deleted successfully' };
};

/**
 * Set exception availability (for holidays, vacations, etc.)
 * @param {Object} exceptionData - Exception data
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const setException = async (exceptionData, providerId) => {
  const { date, dayOfWeek, slots, reason } = exceptionData;

  if (!date) {
    throw new BadRequestError('Date is required for exceptions', 'MISSING_DATE');
  }

  const exception = await availabilityRepository.createAvailability({
    provider: providerId,
    dayOfWeek: dayOfWeek || new Date(date).getDay(),
    slots,
    date: new Date(date),
    isException: true,
    exceptionReason: reason,
    isActive: true
  });

  logger.info(`Exception availability created for provider ${providerId} on ${date}`);

  return exception;
};

/**
 * Get exceptions for a date range
 * @param {string} providerId - Provider ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
export const getExceptions = async (providerId, startDate, endDate) => {
  const exceptions = await availabilityRepository.findExceptions(
    providerId,
    new Date(startDate),
    new Date(endDate)
  );

  return {
    count: exceptions.length,
    data: exceptions
  };
};

/**
 * Check if a time slot is available
 * @param {string} providerId - Provider ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {Promise<Object>}
 */
export const checkSlotAvailability = async (providerId, dayOfWeek, startTime, endTime) => {
  const isAvailable = await availabilityRepository.isSlotAvailable(
    providerId,
    dayOfWeek,
    startTime,
    endTime
  );

  return {
    available: isAvailable,
    slot: { startTime, endTime }
  };
};

/**
 * Book a time slot
 * @param {string} availabilityId - Availability ID
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {string} bookingId - Booking ID
 * @param {string} providerId - Provider ID (for authorization)
 * @returns {Promise<Object>}
 */
export const bookSlot = async (availabilityId, startTime, endTime, bookingId, providerId) => {
  const availability = await getAvailabilityById(availabilityId);

  // Check if user owns this availability
  if (availability.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only book slots for your own availability', 'NOT_AUTHORIZED');
  }

  const updatedAvailability = await availabilityRepository.bookSlot(
    availabilityId,
    startTime,
    endTime,
    bookingId
  );

  if (!updatedAvailability) {
    throw new ConflictError('Slot is already booked or does not exist', 'SLOT_UNAVAILABLE');
  }

  logger.info(`Slot booked: ${startTime}-${endTime} on availability ${availabilityId}`);

  return updatedAvailability;
};

/**
 * Cancel a booked slot
 * @param {string} availabilityId - Availability ID
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {string} providerId - Provider ID (for authorization)
 * @returns {Promise<Object>}
 */
export const cancelSlot = async (availabilityId, startTime, endTime, providerId) => {
  const availability = await getAvailabilityById(availabilityId);

  // Check if user owns this availability
  if (availability.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only cancel slots for your own availability', 'NOT_AUTHORIZED');
  }

  const updatedAvailability = await availabilityRepository.cancelSlot(
    availabilityId,
    startTime,
    endTime
  );

  if (!updatedAvailability) {
    throw new NotFoundError('Slot not found or not booked', 'SLOT_NOT_FOUND');
  }

  logger.info(`Slot cancelled: ${startTime}-${endTime} on availability ${availabilityId}`);

  return updatedAvailability;
};

/**
 * Toggle availability active status
 * @param {string} availabilityId - Availability ID
 * @param {string} providerId - Provider ID (for authorization)
 * @returns {Promise<Object>}
 */
export const toggleActive = async (availabilityId, providerId) => {
  const availability = await getAvailabilityById(availabilityId);

  // Check if user owns this availability
  if (availability.provider._id.toString() !== providerId) {
    throw new ForbiddenError('You can only manage your own availability', 'NOT_AUTHORIZED');
  }

  const updatedAvailability = await availabilityRepository.toggleActive(
    availabilityId,
    !availability.isActive
  );

  logger.info(`Availability ${updatedAvailability.isActive ? 'activated' : 'deactivated'}: ${availabilityId}`);

  return updatedAvailability;
};

/**
 * Delete all availability for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const deleteAllAvailability = async (providerId) => {
  await availabilityRepository.deleteByProvider(providerId);

  logger.info(`All availability deleted for provider ${providerId}`);

  return { message: 'All availability deleted successfully' };
};
