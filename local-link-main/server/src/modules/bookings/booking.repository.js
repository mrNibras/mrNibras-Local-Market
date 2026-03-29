import Booking from './booking.model.js';

/**
 * Booking Repository
 * Handles all database operations for Booking model
 */

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Booking>}
 */
export const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

/**
 * Find booking by ID
 * @param {string} id - Booking ID
 * @param {Object} options - Query options
 * @returns {Promise<Booking|null>}
 */
export const findById = async (id, options = {}) => {
  const { select = '', populate = [] } = options;
  let query = Booking.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);

  return await query;
};

/**
 * Find all bookings with filtering, pagination, and sorting
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findAll = async (filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    select = '',
    populate = []
  } = options;

  const skip = (page - 1) * limit;

  let query = Booking.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (sort) query = query.sort(sort);

  const [bookings, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Booking.countDocuments(filter)
  ]);

  return {
    data: bookings,
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
 * Update booking by ID
 * @param {string} id - Booking ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<Booking|null>}
 */
export const updateById = async (id, updateData, options = {}) => {
  const { newDoc = true, select = '' } = options;
  
  let query = Booking.findByIdAndUpdate(id, updateData, { new: newDoc });
  if (select) query = query.select(select);

  return await query;
};

/**
 * Delete booking by ID
 * @param {string} id - Booking ID
 * @returns {Promise<Booking|null>}
 */
export const deleteById = async (id) => {
  return await Booking.findByIdAndDelete(id);
};

/**
 * Find bookings by customer
 * @param {string} customerId - Customer ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByCustomer = async (customerId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-bookingDate',
    status
  } = options;

  const filter = { customer: customerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('service provider', 'name email profileImage'),
    Booking.countDocuments(filter)
  ]);

  return {
    data: bookings,
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
 * Find bookings by provider
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByProvider = async (providerId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-bookingDate',
    status
  } = options;

  const filter = { provider: providerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('service customer', 'name email profileImage'),
    Booking.countDocuments(filter)
  ]);

  return {
    data: bookings,
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
 * Check for double booking (same provider, same time, active status)
 * @param {string} providerId - Provider ID
 * @param {Date} bookingDate - Booking date
 * @returns {Promise<boolean>}
 */
export const checkDoubleBooking = async (providerId, bookingDate) => {
  return await Booking.checkDoubleBooking(providerId, bookingDate);
};

/**
 * Find bookings by date range
 * @param {string} providerId - Provider ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>}
 */
export const findByDateRange = async (providerId, startDate, endDate) => {
  return await Booking.find({
    provider: providerId,
    bookingDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: { $in: ['pending', 'accepted'] }
  }).populate('customer service');
};

/**
 * Get booking statistics
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const getStats = async (providerId) => {
  const stats = await Booking.aggregate([
    { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    byStatus: {}
  };

  stats.forEach(stat => {
    result.byStatus[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

/**
 * Get upcoming bookings
 * @param {string} userId - User ID
 * @param {string} role - User role (customer or provider)
 * @returns {Promise<Array>}
 */
export const findUpcoming = async (userId, role) => {
  const filter = {
    [role]: userId,
    bookingDate: { $gte: new Date() },
    status: { $in: ['pending', 'accepted'] }
  };

  return await Booking.find(filter)
    .sort('bookingDate')
    .populate(role === 'customer' ? 'provider service' : 'customer service');
};

/**
 * Get past bookings
 * @param {string} userId - User ID
 * @param {string} role - User role (customer or provider)
 * @returns {Promise<Array>}
 */
export const findPast = async (userId, role) => {
  const filter = {
    [role]: userId,
    bookingDate: { $lt: new Date() },
    status: { $in: ['completed', 'cancelled'] }
  };

  return await Booking.find(filter)
    .sort('-bookingDate')
    .populate(role === 'customer' ? 'provider service' : 'customer service');
};

/**
 * Cancel booking
 * @param {string} id - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Booking|null>}
 */
export const cancelBooking = async (id, reason = null) => {
  return await Booking.findByIdAndUpdate(
    id,
    {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date()
    },
    { new: true }
  );
};

/**
 * Complete booking
 * @param {string} id - Booking ID
 * @returns {Promise<Booking|null>}
 */
export const completeBooking = async (id) => {
  return await Booking.findByIdAndUpdate(
    id,
    {
      status: 'completed',
      completedAt: new Date()
    },
    { new: true }
  );
};

/**
 * Accept booking
 * @param {string} id - Booking ID
 * @returns {Promise<Booking|null>}
 */
export const acceptBooking = async (id) => {
  return await Booking.findByIdAndUpdate(
    id,
    { status: 'accepted' },
    { new: true }
  );
};

/**
 * Reject booking
 * @param {string} id - Booking ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Booking|null>}
 */
export const rejectBooking = async (id, reason = null) => {
  return await Booking.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      rejectionReason: reason
    },
    { new: true }
  );
};

// Import mongoose for ObjectId
import mongoose from 'mongoose';
