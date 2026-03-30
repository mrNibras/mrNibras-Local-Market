import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as offerService from './offer.service.js';
import logger from '../../shared/utils/logger.js';

/**
 * Offer Controller
 * Handles HTTP requests for offer operations
 */

/**
 * Create a new offer
 * POST /api/offers
 */
export const createOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.createOffer(req.body, req.user.id);

  logger.info(`Offer created: ${offer._id}`);

  res.status(201).json({
    success: true,
    message: 'Offer created successfully',
    data: offer
  });
});

/**
 * Get offer by ID
 * GET /api/offers/:id
 */
export const getOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.getOffer(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: offer
  });
});

/**
 * Respond to offer (Provider)
 * PATCH /api/offers/:id/respond
 */
export const respondToOffer = asyncHandler(async (req, res) => {
  const { action, counterPrice, message } = req.body;

  const result = await offerService.respondToOffer(
    req.params.id,
    action,
    req.user.id,
    { counterPrice, message }
  );

  res.status(200).json({
    success: true,
    message: `Offer ${action}ed successfully`,
    data: result
  });
});

/**
 * Accept counter offer (Customer)
 * PATCH /api/offers/:id/accept-counter
 */
export const acceptCounter = asyncHandler(async (req, res) => {
  const result = await offerService.acceptCounter(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Counter offer accepted successfully',
    data: result
  });
});

/**
 * Withdraw offer (Customer)
 * PATCH /api/offers/:id/withdraw
 */
export const withdrawOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.withdrawOffer(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Offer withdrawn successfully',
    data: offer
  });
});

/**
 * Get customer offers
 * GET /api/offers/my-offers/customer
 */
export const getCustomerOffers = asyncHandler(async (req, res) => {
  const offers = await offerService.getCustomerOffers(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...offers
  });
});

/**
 * Get provider offers
 * GET /api/offers/my-offers/provider
 */
export const getProviderOffers = asyncHandler(async (req, res) => {
  const offers = await offerService.getProviderOffers(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...offers
  });
});

/**
 * Get offer statistics
 * GET /api/offers/stats
 */
export const getOfferStats = asyncHandler(async (req, res) => {
  const stats = await offerService.getOfferStats(req.user.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Get active offers
 * GET /api/offers/active
 */
export const getActiveOffers = asyncHandler(async (req, res) => {
  const Offer = (await import('./offer.model.js')).default;
  const offers = await Offer.getActiveOffers(req.user.id);

  res.status(200).json({
    success: true,
    count: offers.length,
    data: offers
  });
});
