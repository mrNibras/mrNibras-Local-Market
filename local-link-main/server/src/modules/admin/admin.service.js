import mongoose from 'mongoose';
import User from '../users/user.model.js';
import Service from '../services/service.model.js';
import Booking from '../bookings/booking.model.js';
import Review from '../reviews/review.model.js';

/**
 * Admin Service
 * Contains admin-specific business logic and dashboard statistics
 */

/**
 * Get dashboard statistics
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  const [userStats, serviceStats, bookingStats, reviewStats] = await Promise.all([
    // User statistics
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          verifiedCount: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ]),

    // Service statistics
    Service.aggregate([
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
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

    // Review statistics
    Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          verifiedReviews: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ])
  ]);

  // Process user stats
  const users = { total: 0 };
  userStats.forEach(stat => {
    users[stat._id] = stat.count;
    users[`${stat._id}Verified`] = stat.verifiedCount;
    users.total += stat.count;
  });

  // Process service stats
  const services = serviceStats[0] || {
    totalServices: 0,
    activeServices: 0,
    avgPrice: 0,
    avgRating: 0
  };

  // Process booking stats
  const bookings = { total: 0 };
  bookingStats.forEach(stat => {
    bookings[stat._id] = stat.count;
    bookings.total += stat.count;
  });

  // Process review stats
  const reviews = reviewStats[0] || {
    totalReviews: 0,
    avgRating: 0,
    verifiedReviews: 0
  };

  return {
    users,
    services,
    bookings,
    reviews,
    lastUpdated: new Date()
  };
};

/**
 * Get recent activities
 * @param {number} limit - Number of activities to return
 * @returns {Promise<Array>}
 */
export const getRecentActivities = async (limit = 10) => {
  const [recentUsers, recentBookings, recentReviews] = await Promise.all([
    User.find().sort('-createdAt').limit(limit).select('name email role createdAt'),
    Booking.find().sort('-createdAt').limit(limit).populate('customer provider', 'name').select('status bookingDate createdAt'),
    Review.find().sort('-createdAt').limit(limit).populate('user service', 'name title').select('rating comment createdAt')
  ]);

  // Combine and sort all activities
  const activities = [
    ...recentUsers.map(user => ({
      type: 'user',
      action: 'registered',
      data: user,
      timestamp: user.createdAt
    })),
    ...recentBookings.map(booking => ({
      type: 'booking',
      action: booking.status,
      data: booking,
      timestamp: booking.createdAt
    })),
    ...recentReviews.map(review => ({
      type: 'review',
      action: 'created',
      data: review,
      timestamp: review.createdAt
    }))
  ];

  // Sort by timestamp and limit
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return activities.slice(0, limit);
};

/**
 * Get system health metrics
 * @returns {Promise<Object>}
 */
export const getSystemHealth = async () => {
  const dbConnection = mongoose.connection;

  return {
    database: {
      status: dbConnection.readyState === 1 ? 'connected' : 'disconnected',
      host: dbConnection.host,
      name: dbConnection.name
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  };
};

/**
 * Get all pending bookings
 * @returns {Promise<Object>}
 */
export const getPendingBookings = async () => {
  const bookings = await Booking.find({ status: 'pending' })
    .populate('customer provider service', 'name email title')
    .sort('bookingDate');

  return {
    count: bookings.length,
    data: bookings
  };
};

/**
 * Get reported content (placeholder for future reporting system)
 * @returns {Promise<Object>}
 */
export const getReportedContent = async () => {
  // Placeholder - can be extended with a reporting system
  return {
    reports: [],
    count: 0
  };
};

/**
 * Get users by role
 * @param {string} role - User role
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getUsersByRole = async (role, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ role }).skip(skip).limit(limit).select('-password'),
    User.countDocuments({ role })
  ]);

  return {
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get services by category
 * @param {string} category - Category name
 * @returns {Promise<Object>}
 */
export const getServicesByCategory = async (category) => {
  const services = await Service.find({ category })
    .populate('provider', 'name email')
    .sort('-averageRating');

  return {
    count: services.length,
    data: services
  };
};

/**
 * Delete user (Admin)
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Also delete related data
  await Promise.all([
    Service.deleteMany({ provider: userId }),
    Booking.deleteMany({ $or: [{ customer: userId }, { provider: userId }] }),
    Review.deleteMany({ $or: [{ user: userId }, { provider: userId }] })
  ]);

  return { message: 'User and related data deleted successfully' };
};

/**
 * Delete service (Admin)
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const deleteService = async (serviceId) => {
  const service = await Service.findByIdAndDelete(serviceId);

  if (!service) {
    throw new Error('Service not found');
  }

  // Also delete related reviews
  await Review.deleteMany({ service: serviceId });

  return { message: 'Service and related reviews deleted successfully' };
};

/**
 * Get analytics data
 * @param {string} timeframe - Timeframe (day, week, month, year)
 * @returns {Promise<Object>}
 */
export const getAnalytics = async (timeframe = 'month') => {
  const now = new Date();
  let startDate;

  switch (timeframe) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const [newUsers, newBookings, newReviews] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Booking.countDocuments({ createdAt: { $gte: startDate } }),
    Review.countDocuments({ createdAt: { $gte: startDate } })
  ]);

  return {
    timeframe,
    startDate,
    endDate: new Date(),
    metrics: {
      newUsers,
      newBookings,
      newReviews
    }
  };
};
