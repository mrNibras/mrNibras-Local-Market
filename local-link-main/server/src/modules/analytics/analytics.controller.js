import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as analyticsService from './analytics.service.js';

/**
 * Analytics Controller
 */

export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getPlatformStats();
  
  res.json({
    success: true,
    data: stats
  });
});

export const getProviderAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getProviderAnalytics(req.user.id, req.query);
  
  res.json({
    success: true,
    data: analytics
  });
});

export const getMarketplaceTrends = asyncHandler(async (req, res) => {
  const { period = 30 } = req.query;
  const trends = await analyticsService.getMarketplaceTrends(parseInt(period));
  
  res.json({
    success: true,
    data: trends
  });
});

export const getCategoryPerformance = asyncHandler(async (req, res) => {
  const categories = await analyticsService.getCategoryPerformance();
  
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

export const calculateTrustScore = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const score = await analyticsService.calculateTrustScore(providerId);
  
  res.json({
    success: true,
    data: { providerId, trustScore: score }
  });
});
