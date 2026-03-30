import Notification from './notification.model.js';

/**
 * Notification Repository
 * Handles database operations for notifications
 */

/**
 * Create notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Notification>}
 */
export const create = async (notificationData) => {
  return await Notification.create(notificationData);
};

/**
 * Find notification by ID
 * @param {string} id - Notification ID
 * @returns {Promise<Notification|null>}
 */
export const findById = async (id) => {
  return await Notification.findById(id);
};

/**
 * Get user notifications with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getUserNotifications = async (userId, options = {}) => {
  return await Notification.getUserNotifications(userId, options);
};

/**
 * Get unread count
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const getUnreadCount = async (userId) => {
  return await Notification.getUnreadCount(userId);
};

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<Notification>}
 */
export const markAsRead = async (id) => {
  const notification = await Notification.findById(id);
  if (notification) {
    await notification.markAsRead();
  }
  return notification;
};

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

/**
 * Delete notification
 * @param {string} id - Notification ID
 * @returns {Promise<Notification|null>}
 */
export const deleteById = async (id) => {
  return await Notification.findByIdAndDelete(id);
};

/**
 * Delete read notifications
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const deleteRead = async (userId) => {
  return await Notification.deleteMany({ user: userId, isRead: true });
};

/**
 * Find notifications by user and type
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByType = async (userId, type, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId, type })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: userId, type })
  ]);

  return {
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
