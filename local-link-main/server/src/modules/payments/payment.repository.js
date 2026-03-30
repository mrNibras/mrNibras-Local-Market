import Payment from './payment.model.js';

/**
 * Payment Repository
 * Handles all database operations for Payment model
 */

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Payment>}
 */
export const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

/**
 * Find payment by ID
 * @param {string} id - Payment ID
 * @param {Object} options - Query options
 * @returns {Promise<Payment|null>}
 */
export const findById = async (id, options = {}) => {
  const { select = '', populate = [] } = options;
  let query = Payment.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);

  return await query;
};

/**
 * Find payment by booking ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Payment|null>}
 */
export const findByBooking = async (bookingId) => {
  return await Payment.findOne({ booking: bookingId });
};

/**
 * Find payment by Stripe payment intent ID
 * @param {string} intentId - Stripe payment intent ID
 * @returns {Promise<Payment|null>}
 */
export const findByStripeIntentId = async (intentId) => {
  return await Payment.findOne({ stripePaymentIntentId: intentId });
};

/**
 * Find all payments with filtering, pagination, and sorting
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

  let query = Payment.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (sort) query = query.sort(sort);

  const [payments, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Payment.countDocuments(filter)
  ]);

  return {
    data: payments,
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
 * Find payments by customer
 * @param {string} customerId - Customer ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByCustomer = async (customerId, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt', status } = options;

  const filter = { customer: customerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('service provider', 'name title'),
    Payment.countDocuments(filter)
  ]);

  return {
    data: payments,
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
 * Find payments by provider
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByProvider = async (providerId, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt', status } = options;

  const filter = { provider: providerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('service customer', 'name title'),
    Payment.countDocuments(filter)
  ]);

  return {
    data: payments,
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
 * Update payment by ID
 * @param {string} id - Payment ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<Payment|null>}
 */
export const updatePayment = async (id, updateData, options = {}) => {
  const { newDoc = true, select = '' } = options;

  let query = Payment.findByIdAndUpdate(id, updateData, { new: newDoc });
  if (select) query = query.select(select);

  return await query;
};

/**
 * Delete payment by ID
 * @param {string} id - Payment ID
 * @returns {Promise<Payment|null>}
 */
export const deleteById = async (id) => {
  return await Payment.findByIdAndDelete(id);
};

/**
 * Get payment statistics
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const getStatistics = async (providerId) => {
  return await Payment.getStatistics(providerId);
};

/**
 * Get pending payments
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findPending = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ status: 'pending' })
      .sort('createdAt')
      .skip(skip)
      .limit(limit)
      .populate('customer provider service'),
    Payment.countDocuments({ status: 'pending' })
  ]);

  return {
    data: payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get completed payments in date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByDateRange = async (startDate, endDate, options = {}) => {
  const { provider, customer } = options;

  const filter = {
    status: 'completed',
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  if (provider) filter.provider = provider;
  if (customer) filter.customer = customer;

  const payments = await Payment.find(filter)
    .populate('customer provider service booking');

  return payments;
};
