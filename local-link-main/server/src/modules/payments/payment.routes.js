import express from 'express';
import * as paymentController from './payment.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Customer routes
router.post('/create-intent', paymentController.createPaymentIntent);
router.get('/my-payments', paymentController.getMyPayments);
router.get('/:id', paymentController.getPayment);

// Provider routes
router.get('/provider/payments', restrictTo('provider', 'admin'), paymentController.getProviderPayments);
router.get('/provider/stats', restrictTo('provider', 'admin'), paymentController.getProviderStats);

// Refund (Customer or Admin)
router.post('/:id/refund', paymentController.processRefund);

// Admin routes
router.get('/', restrictTo('admin'), paymentController.getAllPayments);
router.get('/pending', restrictTo('admin'), paymentController.getPendingPayments);

// Webhook (public - Stripe will call this)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;
