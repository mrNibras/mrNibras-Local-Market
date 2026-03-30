import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as paymentService from './payment.service.js';
import envVars from '../../config/env.js';
import logger from '../../shared/utils/logger.js';

/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */

/**
 * Create payment intent
 * POST /api/payments/create-intent
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { booking, amount, currency } = req.body;

  const result = await paymentService.createPaymentIntent(
    { booking, amount, currency },
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: 'Payment intent created',
    data: result
  });
});

/**
 * Confirm payment (webhook)
 * POST /api/payments/webhook
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = envVars.STRIPE_WEBHOOK_SECRET;

  try {
    const stripe = (await import('stripe')).default;
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    await paymentService.handleWebhookEvent(event);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`
    });
  }
});

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPayment(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: payment
  });
});

/**
 * Get customer payments
 * GET /api/payments/my-payments
 */
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getCustomerPayments(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...payments
  });
});

/**
 * Get provider payments
 * GET /api/payments/provider/payments
 */
export const getProviderPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getProviderPayments(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...payments
  });
});

/**
 * Get provider payment statistics
 * GET /api/payments/provider/stats
 */
export const getProviderStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getProviderStats(req.user.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Process refund
 * POST /api/payments/:id/refund
 */
export const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  const payment = await paymentService.processRefund(
    req.params.id,
    req.user.id,
    { amount, reason }
  );

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: payment
  });
});

/**
 * Get all payments (Admin only)
 * GET /api/payments
 */
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getAllPayments(req.query);

  res.status(200).json({
    success: true,
    ...payments
  });
});

/**
 * Get pending payments
 * GET /api/payments/pending
 */
export const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPendingPayments(req.query);

  res.status(200).json({
    success: true,
    ...payments
  });
});
