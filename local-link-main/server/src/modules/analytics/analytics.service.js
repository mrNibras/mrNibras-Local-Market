import mongoose from 'mongoose';
import User from '../users/user.model.js';
import Service from '../services/service.model.js';
import Booking from '../bookings/booking.model.js';
import Payment from '../payments/payment.model.js';
import Review from '../reviews/review.model.js';

/**
 * Analytics Service
 * Provides comprehensive analytics for admin and providers
 */

/**
 * Get platform-wide statistics (Admin)
 * @returns {Promise<Object>}
 */
export const getPlatformStats = async () => {
  const now = new Date();
  const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

  const [
    userStats,
    serviceStats,
    bookingStats,
    paymentStats,
    reviewStats
  ] = await Promise.all([
    // User statistics
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ]),

    // Service statistics
    Service.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]),

    // Booking statistics
    Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    // Payment statistics
    Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]),

    // Review statistics
    Review.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ])
  ]);

  // Process results
  const users = { total: 0 };
  userStats.forEach(stat => {
    users[stat._id] = stat.count;
    users[`${stat._id}Verified`] = stat.verified;
    users.total += stat.count;
  });

  const services = serviceStats[0] || {
    total: 0,
    active: 0,
    avgPrice: 0,
    avgRating: 0
  };

  const bookings = { total: 0 };
  bookingStats.forEach(stat => {
    bookings[stat._id] = stat.count;
    bookings.total += stat.count;
  });

  const payments = { total: 0, revenue: 0 };
  paymentStats.forEach(stat => {
    payments[stat._id] = { count: stat.count, total: stat.total };
    payments.total += stat.count;
    if (stat._id === 'completed') {
      payments.revenue += stat.total;
    }
  });

  const reviews = reviewStats[0] || {
    count: 0,
    avgRating: 0
  };

  return {
    users,
    services,
    bookings,
    payments,
    reviews,
    lastUpdated: new Date()
  };
};

/**
 * Get provider analytics
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getProviderAnalytics = async (providerId, options = {}) => {
  const { period = '30' } = options; // days
  const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

  const [
    bookingsData,
    earningsData,
    reviewsData,
    servicesData
  ] = await Promise.all([
    // Booking trends
    Booking.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Earnings
    Payment.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$providerEarnings' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Recent reviews
    Review.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgQuality: { $avg: '$metrics.quality' },
          avgCommunication: { $avg: '$metrics.communication' },
          avgTimeliness: { $avg: '$metrics.timeliness' }
        }
      }
    ]),

    // Service performance
    Service.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          bookings: { $sum: 0 },
          revenue: { $sum: 0 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ])
  ]);

  // Calculate conversion rate
  const totalBookings = bookingsData.reduce((sum, d) => sum + d.count, 0);
  const completedBookings = bookingsData.reduce((sum, d) => sum + d.completed, 0);
  const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(2) : 0;

  // Calculate total earnings
  const totalEarnings = earningsData.reduce((sum, d) => sum + d.total, 0);

  return {
    period: `${period} days`,
    startDate,
    endDate: new Date(),
    bookings: {
      trend: bookingsData,
      total: totalBookings,
      completed: completedBookings,
      conversionRate: parseFloat(conversionRate)
    },
    earnings: {
      trend: earningsData,
      total: totalEarnings,
      average: earningsData.length > 0 ? totalEarnings / earningsData.length : 0
    },
    reviews: reviewsData[0] || {
      count: 0,
      avgRating: 0,
      avgQuality: 0,
      avgCommunication: 0,
      avgTimeliness: 0
    },
    topServices: servicesData
  };
};

/**
 * Get marketplace trends
 * @param {string} period - Period in days
 * @returns {Promise<Object>}
 */
export const getMarketplaceTrends = async (period = 30) => {
  const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

  const [bookings, payments, newUsers] = await Promise.all([
    Booking.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    period: `${period} days`,
    bookings,
    revenue: payments,
    newUsers,
    growth: {
      bookings: bookings.length > 0 ? bookings[bookings.length - 1].count : 0,
      revenue: payments.length > 0 ? payments[payments.length - 1].total : 0,
      users: newUsers.length > 0 ? newUsers[newUsers.length - 1].count : 0
    }
  };
};

/**
 * Get category performance
 * @returns {Promise<Object>}
 */
export const getCategoryPerformance = async () => {
  return await Service.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$averageRating' },
        totalReviews: { $sum: '$totalReviews' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Calculate trust score for provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<number>}
 */
export const calculateTrustScore = async (providerId) => {
  const provider = await User.findById(providerId);
  if (!provider || provider.role !== 'provider') return 0;

  const [bookingStats, reviewStats] = await Promise.all([
    Booking.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]),

    Review.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const stats = bookingStats[0] || { total: 0, completed: 0, cancelled: 0 };
  const reviews = reviewStats[0] || { avgRating: 0, count: 0 };

  // Calculate score components (0-100)
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const ratingScore = reviews.avgRating * 20; // 5 stars = 100
  const experienceScore = Math.min(stats.total * 2, 40); // Cap at 40
  const cancellationPenalty = stats.total > 0 ? (stats.cancelled / stats.total) * 20 : 0;

  const trustScore = Math.min(100, Math.max(0,
    (completionRate * 0.3) +
    (ratingScore * 0.4) +
    experienceScore -
    cancellationPenalty
  ));

  // Update user trust score
  await User.findByIdAndUpdate(providerId, {
    trustScore: Math.round(trustScore)
  });

  return Math.round(trustScore);
};
