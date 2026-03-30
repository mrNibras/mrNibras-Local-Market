import express from 'express';
import * as analyticsController from './analytics.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';

const router = express.Router();
router.use(protect);

// Admin analytics
router.get('/platform', restrictTo('admin'), analyticsController.getPlatformStats);
router.get('/trends', restrictTo('admin'), analyticsController.getMarketplaceTrends);
router.get('/categories', restrictTo('admin'), analyticsController.getCategoryPerformance);

// Provider analytics
router.get('/provider', restrictTo('provider', 'admin'), analyticsController.getProviderAnalytics);

// Trust score calculation
router.post('/calculate-trust/:providerId', restrictTo('admin'), analyticsController.calculateTrustScore);

export default router;
