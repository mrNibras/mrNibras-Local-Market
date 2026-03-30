import express from 'express';
import * as offerController from './offer.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

// All offer routes require authentication
router.use(protect);

// Create offer
router.post('/', offerController.createOffer);

// Get active offers
router.get('/active', offerController.getActiveOffers);

// Get customer offers
router.get('/my-offers/customer', offerController.getCustomerOffers);

// Get provider offers
router.get('/my-offers/provider', offerController.getProviderOffers);

// Get offer statistics
router.get('/stats', offerController.getOfferStats);

// Offer actions
router.get('/:id', offerController.getOffer);
router.patch('/:id/respond', offerController.respondToOffer);
router.patch('/:id/accept-counter', offerController.acceptCounter);
router.patch('/:id/withdraw', offerController.withdrawOffer);

export default router;
