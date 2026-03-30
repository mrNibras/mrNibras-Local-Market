import Stripe from 'stripe';
import envVars from '../../config/env.js';
import * as paymentRepository from './payment.repository.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

// Initialize Stripe
const stripe = new Stripe(envVars.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Payment Service
 * Handles payment processing, refunds, and payout management
 */

/**
 * Create payment intent for a booking
 * @param {Object} paymentData - Payment information
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>}
 */
export const createPaymentIntent = async (paymentData, customerId) => {
  const { booking, amount, currency = 'usd' } = paymentData;

  // Verify booking exists and belongs to customer
  const Booking = (await import('../bookings/booking.model.js')).default;
  const bookingDoc = await Booking.findOne({
    _id: booking,
    customer: customerId
  });

  if (!bookingDoc) {
    throw new NotFoundError('Booking not found or does not belong to customer', 'BOOKING_NOT_FOUND');
  }

  // Check if payment already exists
  const existingPayment = await paymentRepository.findByBooking(booking);
  if (existingPayment) {
    throw new BadRequestError('Payment already exists for this booking', 'PAYMENT_EXISTS');
  }

  // Create Stripe payment intent
  const stripeIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: {
      bookingId: booking.toString(),
      customerId: customerId.toString(),
      providerId: bookingDoc.provider.toString()
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  // Create payment record
  const payment = await paymentRepository.createPayment({
    booking,
    customer: customerId,
    provider: bookingDoc.provider,
    service: bookingDoc.service,
    amount,
    currency: currency.toUpperCase(),
    paymentMethod: 'stripe',
    stripePaymentIntentId: stripeIntent.id,
    status: 'pending',
    metadata: {
      stripeClientSecret: stripeIntent.client_secret
    }
  });

  logger.info(`Payment intent created: ${stripeIntent.id} for booking ${booking}`);

  return {
    paymentId: payment._id,
    clientSecret: stripeIntent.client_secret,
    amount,
    currency
  };
};

/**
 * Confirm payment after Stripe webhook
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>}
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestError('Payment not successful', 'PAYMENT_FAILED');
    }

    // Find payment in database
    const payment = await paymentRepository.findByStripeIntentId(paymentIntentId);

    if (!payment) {
      throw new NotFoundError('Payment record not found', 'PAYMENT_NOT_FOUND');
    }

    // Update payment status
    const updatedPayment = await paymentRepository.updatePayment(payment._id, {
      status: 'completed',
      stripeData: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method
      },
      receiptUrl: paymentIntent.receipt_url,
      receiptEmail: paymentIntent.receipt_email
    });

    // Update booking status to accepted
    const Booking = (await import('../bookings/booking.model.js')).default;
    await Booking.findByIdAndUpdate(payment.booking, { status: 'accepted' });

    logger.info(`Payment confirmed: ${paymentIntentId}`);

    return updatedPayment;
  } catch (error) {
    logger.error(`Payment confirmation error: ${error.message}`);
    throw error;
  }
};

/**
 * Process refund
 * @param {string} paymentId - Payment ID
 * @param {string} requesterId - User requesting refund
 * @param {Object} refundData - Refund information
 * @returns {Promise<Object>}
 */
export const processRefund = async (paymentId, requesterId, refundData = {}) => {
  const payment = await paymentRepository.findById(paymentId, {
    populate: ['booking', 'customer', 'provider']
  });

  if (!payment) {
    throw new NotFoundError('Payment not found', 'PAYMENT_NOT_FOUND');
  }

  // Only admin or customer can request refund
  if (payment.customer._id.toString() !== requesterId) {
    const User = (await import('../users/user.model.js')).default;
    const user = await User.findById(requesterId);
    if (user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to refund this payment', 'NOT_AUTHORIZED');
    }
  }

  if (payment.status !== 'completed') {
    throw new BadRequestError('Can only refund completed payments', 'INVALID_STATUS');
  }

  // Process refund through Stripe
  if (payment.paymentMethod === 'stripe') {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundData.amount ? Math.round(refundData.amount * 100) : undefined,
      reason: refundData.reason || 'requested_by_customer'
    });

    // Update payment record
    const updatedPayment = await paymentRepository.updatePayment(paymentId, {
      status: 'refunded',
      refundInfo: {
        amount: refundData.amount || payment.amount,
        reason: refundData.reason || 'Requested by customer',
        refundedAt: new Date(),
        refundedBy: requesterId,
        stripeRefundId: refund.id
      }
    });

    // Update booking status
    const Booking = (await import('../bookings/booking.model.js')).default;
    await Booking.findByIdAndUpdate(payment.booking, { status: 'cancelled' });

    logger.info(`Refund processed: ${refund.id} for payment ${paymentId}`);

    return updatedPayment;
  }

  throw new BadRequestError('Refund not supported for this payment method', 'REFUND_NOT_SUPPORTED');
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>}
 */
export const getPayment = async (paymentId, userId) => {
  const payment = await paymentRepository.findById(paymentId, {
    populate: [
      { path: 'customer', select: 'name email' },
      { path: 'provider', select: 'name email' },
      { path: 'service', select: 'title' },
      { path: 'booking', select: 'bookingDate status' }
    ]
  });

  if (!payment) {
    throw new NotFoundError('Payment not found', 'PAYMENT_NOT_FOUND');
  }

  // Authorization check
  const isCustomer = payment.customer._id.toString() === userId;
  const isProvider = payment.provider._id.toString() === userId;

  if (!isCustomer && !isProvider) {
    const User = (await import('../users/user.model.js')).default;
    const user = await User.findById(userId);
    if (user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this payment', 'NOT_AUTHORIZED');
    }
  }

  return payment;
};

/**
 * Get customer payments
 * @param {string} customerId - Customer ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getCustomerPayments = async (customerId, options = {}) => {
  return await paymentRepository.findByCustomer(customerId, options);
};

/**
 * Get provider payments
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getProviderPayments = async (providerId, options = {}) => {
  return await paymentRepository.findByProvider(providerId, options);
};

/**
 * Get payment statistics for provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const getProviderStats = async (providerId) => {
  return await paymentRepository.getStatistics(providerId);
};

/**
 * Get all payments (Admin)
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getAllPayments = async (options = {}) => {
  return await paymentRepository.findAll({}, options);
};

/**
 * Handle Stripe webhook events
 * @param {Object} event - Stripe webhook event
 * @returns {Promise<void>}
 */
export const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await confirmPayment(event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      const payment = await paymentRepository.findByStripeIntentId(event.data.object.id);
      if (payment) {
        await paymentRepository.updatePayment(payment._id, { status: 'failed' });
      }
      break;

    case 'charge.refunded':
      // Handle refund webhooks
      break;

    default:
      logger.warn(`Unhandled webhook event type: ${event.type}`);
  }
};
