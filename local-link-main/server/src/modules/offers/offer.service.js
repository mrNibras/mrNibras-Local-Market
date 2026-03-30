import Offer from './offer.model.js';
import Booking from '../bookings/booking.model.js';
import Service from '../services/service.model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Offer Service
 * Handles offer creation, negotiation, and conversion to bookings
 */

/**
 * Create a new offer
 * @param {Object} offerData - Offer data
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>}
 */
export const createOffer = async (offerData, customerId) => {
  const { service: serviceId, proposedPrice, description } = offerData;

  // Verify service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  // Prevent self-offers
  if (service.provider.toString() === customerId) {
    throw new BadRequestError('Cannot create offer on your own service', 'SELF_OFFER');
  }

  // Validate price (should be reasonable compared to listed price)
  if (proposedPrice < service.price * 0.3) {
    throw new BadRequestError('Proposed price is too low (min 30% of listed price)', 'PRICE_TOO_LOW');
  }

  // Check if active offer already exists
  const existingOffer = await Offer.findOne({
    service: serviceId,
    customer: customerId,
    provider: service.provider,
    status: { $in: ['pending', 'countered'] },
    expiresAt: { $gt: new Date() }
  });

  if (existingOffer) {
    throw new BadRequestError('You already have an active offer for this service', 'OFFER_EXISTS');
  }

  // Create offer
  const offer = await Offer.createOffer(
    serviceId,
    customerId,
    service.provider,
    proposedPrice,
    description
  );

  // Populate offer
  const populatedOffer = await Offer.findById(offer._id)
    .populate('service', 'title category price')
    .populate('customer', 'name email')
    .populate('provider', 'name email');

  logger.info(`Offer created: ${offer._id} by customer ${customerId}`);

  return populatedOffer;
};

/**
 * Get offer by ID
 * @param {string} offerId - Offer ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>}
 */
export const getOffer = async (offerId, userId) => {
  const offer = await Offer.findById(offerId)
    .populate('service', 'title category price')
    .populate('customer', 'name email profileImage')
    .populate('provider', 'name email profileImage');

  if (!offer) {
    throw new NotFoundError('Offer not found', 'OFFER_NOT_FOUND');
  }

  // Authorization check
  const isCustomer = offer.customer._id.toString() === userId;
  const isProvider = offer.provider._id.toString() === userId;

  if (!isCustomer && !isProvider) {
    const User = (await import('../users/user.model.js')).default;
    const user = await User.findById(userId);
    if (user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this offer', 'NOT_AUTHORIZED');
    }
  }

  return offer;
};

/**
 * Respond to offer (Provider: accept/reject/counter)
 * @param {string} offerId - Offer ID
 * @param {string} action - Action (accept, reject, counter)
 * @param {string} providerId - Provider ID
 * @param {Object} counterData - Counter offer data
 * @returns {Promise<Object>}
 */
export const respondToOffer = async (offerId, action, providerId, counterData = {}) => {
  const offer = await getOffer(offerId, providerId);

  // Verify provider owns this offer
  if (offer.provider._id.toString() !== providerId) {
    throw new ForbiddenError('Not authorized to respond to this offer', 'NOT_AUTHORIZED');
  }

  // Check offer status
  if (offer.status !== 'pending' && offer.status !== 'countered') {
    throw new BadRequestError(`Cannot respond to ${offer.status} offer`, 'INVALID_STATUS');
  }

  let result;

  switch (action) {
    case 'accept':
      result = await acceptOffer(offer, providerId);
      break;

    case 'reject':
      result = await rejectOffer(offer, providerId, counterData.message);
      break;

    case 'counter':
      if (!counterData.counterPrice) {
        throw new BadRequestError('Counter price is required', 'MISSING_PRICE');
      }
      result = await counterOffer(offer, providerId, counterData.counterPrice, counterData.message);
      break;

    default:
      throw new BadRequestError('Invalid action. Use: accept, reject, or counter', 'INVALID_ACTION');
  }

  return result;
};

/**
 * Accept counter offer (Customer)
 * @param {string} offerId - Offer ID
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>}
 */
export const acceptCounter = async (offerId, customerId) => {
  const offer = await getOffer(offerId, customerId);

  // Verify customer owns this offer
  if (offer.customer._id.toString() !== customerId) {
    throw new ForbiddenError('Not authorized to accept this counter offer', 'NOT_AUTHORIZED');
  }

  // Check offer status
  if (offer.status !== 'countered') {
    throw new BadRequestError('No counter offer to accept', 'NO_COUNTER');
  }

  return await acceptOffer(offer, customerId);
};

/**
 * Withdraw offer (Customer)
 * @param {string} offerId - Offer ID
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>}
 */
export const withdrawOffer = async (offerId, customerId) => {
  const offer = await getOffer(offerId, customerId);

  // Verify customer owns this offer
  if (offer.customer._id.toString() !== customerId) {
    throw new ForbiddenError('Not authorized to withdraw this offer', 'NOT_AUTHORIZED');
  }

  await offer.withdraw(customerId);

  logger.info(`Offer withdrawn: ${offerId}`);

  return offer;
};

/**
 * Get customer offers
 * @param {string} customerId - Customer ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getCustomerOffers = async (customerId, options = {}) => {
  const { status, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const filter = { customer: customerId };
  if (status) filter.status = status;

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('service', 'title category')
      .populate('provider', 'name'),
    Offer.countDocuments(filter)
  ]);

  return {
    data: offers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get provider offers
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getProviderOffers = async (providerId, options = {}) => {
  const { status, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const filter = { provider: providerId };
  if (status) filter.status = status;

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('service', 'title')
      .populate('customer', 'name'),
    Offer.countDocuments(filter)
  ]);

  return {
    data: offers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get offer statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getOfferStats = async (userId) => {
  return await Offer.getStatistics(userId);
};

// Helper functions

async function acceptOffer(offer, userId) {
  offer.status = 'accepted';
  await offer.save();

  // Create booking automatically
  const booking = await Booking.create({
    customer: offer.customer,
    provider: offer.provider,
    service: offer.service,
    bookingDate: new Date(Date.now() + 86400000), // Tomorrow by default
    duration: 60,
    price: offer.counterPrice || offer.proposedPrice,
    status: 'pending',
    notes: `Created from accepted offer #${offer._id}`
  });

  // Link booking to offer
  offer.booking = booking._id;
  offer.negotiationHistory.push({
    type: 'accept',
    by: userId,
    timestamp: new Date()
  });
  await offer.save();

  logger.info(`Offer accepted: ${offer._id}, Booking created: ${booking._id}`);

  const populatedOffer = await Offer.findById(offer._id)
    .populate('booking')
    .populate('service')
    .populate('customer')
    .populate('provider');

  return { offer: populatedOffer, booking };
}

async function rejectOffer(offer, userId, message) {
  await offer.reject(userId);
  offer.negotiationHistory[offer.negotiationHistory.length - 1].message = message;
  await offer.save();

  logger.info(`Offer rejected: ${offer._id}`);

  return offer;
}

async function counterOffer(offer, userId, counterPrice, message) {
  await offer.counter(counterPrice, userId, message);

  logger.info(`Offer countered: ${offer._id}, Counter price: ${counterPrice}`);

  return offer;
}
