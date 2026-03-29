import Availability from './availability.model.js';

/**
 * Availability Repository
 * Handles all database operations for Availability model
 */

/**
 * Create availability
 * @param {Object} availabilityData - Availability data
 * @returns {Promise<Availability>}
 */
export const createAvailability = async (availabilityData) => {
  return await Availability.create(availabilityData);
};

/**
 * Find availability by ID
 * @param {string} id - Availability ID
 * @param {Object} options - Query options
 * @returns {Promise<Availability|null>}
 */
export const findById = async (id, options = {}) => {
  const { select = '', populate = [] } = options;
  let query = Availability.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);

  return await query;
};

/**
 * Find all availability records with filtering
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findAll = async (filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = 'dayOfWeek',
    select = '',
    populate = []
  } = options;

  const skip = (page - 1) * limit;

  let query = Availability.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (sort) query = query.sort(sort);

  const [availabilities, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Availability.countDocuments(filter)
  ]);

  return {
    data: availabilities,
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
 * Update availability by ID
 * @param {string} id - Availability ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<Availability|null>}
 */
export const updateById = async (id, updateData, options = {}) => {
  const { newDoc = true, select = '' } = options;
  
  let query = Availability.findByIdAndUpdate(id, updateData, { new: newDoc });
  if (select) query = query.select(select);

  return await query;
};

/**
 * Delete availability by ID
 * @param {string} id - Availability ID
 * @returns {Promise<Availability|null>}
 */
export const deleteById = async (id) => {
  return await Availability.findByIdAndDelete(id);
};

/**
 * Find availability by provider
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export const findByProvider = async (providerId, options = {}) => {
  const { isActive = true } = options;
  
  const filter = { provider: providerId };
  if (isActive !== undefined) filter.isActive = isActive;

  return await Availability.find(filter).sort('dayOfWeek');
};

/**
 * Find availability by provider and day of week
 * @param {string} providerId - Provider ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {Promise<Availability|null>}
 */
export const findByDayOfWeek = async (providerId, dayOfWeek) => {
  return await Availability.findOne({
    provider: providerId,
    dayOfWeek,
    isException: false,
    isActive: true
  });
};

/**
 * Get all availability for a provider (regular schedule)
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>}
 */
export const getProviderSchedule = async (providerId) => {
  return await Availability.find({
    provider: providerId,
    isException: false,
    isActive: true
  }).sort('dayOfWeek');
};

/**
 * Get exception availability for a date range
 * @param {string} providerId - Provider ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>}
 */
export const findExceptions = async (providerId, startDate, endDate) => {
  return await Availability.find({
    provider: providerId,
    isException: true,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

/**
 * Check if a time slot is available
 * @param {string} providerId - Provider ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {Promise<boolean>}
 */
export const isSlotAvailable = async (providerId, dayOfWeek, startTime, endTime) => {
  return await Availability.isSlotAvailable(providerId, dayOfWeek, startTime, endTime);
};

/**
 * Book a time slot
 * @param {string} availabilityId - Availability ID
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Availability|null>}
 */
export const bookSlot = async (availabilityId, startTime, endTime, bookingId) => {
  return await Availability.findOneAndUpdate(
    {
      _id: availabilityId,
      'slots.startTime': startTime,
      'slots.endTime': endTime,
      'slots.isBooked': false
    },
    {
      $set: {
        'slots.$.isBooked': true,
        'slots.$.bookingId': bookingId
      }
    },
    { new: true }
  );
};

/**
 * Cancel a booked slot
 * @param {string} availabilityId - Availability ID
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {Promise<Availability|null>}
 */
export const cancelSlot = async (availabilityId, startTime, endTime) => {
  return await Availability.findOneAndUpdate(
    {
      _id: availabilityId,
      'slots.startTime': startTime,
      'slots.endTime': endTime
    },
    {
      $set: {
        'slots.$.isBooked': false,
        'slots.$.bookingId': null
      }
    },
    { new: true }
  );
};

/**
 * Toggle availability active status
 * @param {string} id - Availability ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Availability|null>}
 */
export const toggleActive = async (id, isActive) => {
  return await Availability.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );
};

/**
 * Delete all availability for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const deleteByProvider = async (providerId) => {
  return await Availability.deleteMany({ provider: providerId });
};

/**
 * Get available slots for a day
 * @param {string} providerId - Provider ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {Promise<Array>}
 */
export const getAvailableSlots = async (providerId, dayOfWeek) => {
  const availability = await findByDayOfWeek(providerId, dayOfWeek);
  
  if (!availability) return [];

  return availability.slots.filter(slot => !slot.isBooked).map(slot => ({
    startTime: slot.startTime,
    endTime: slot.endTime
  }));
};
