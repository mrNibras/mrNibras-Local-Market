import * as notificationRepository from './notification.repository.js';
import * as emailService from './email.service.js';
import logger from '../../shared/utils/logger.js';

/**
 * Notification Service
 * Handles in-app and email notifications
 */

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>}
 */
export const createNotification = async (notificationData) => {
  const notification = await notificationRepository.create(notificationData);

  // Send email if channel enabled
  if (notificationData.channels?.email && notificationData.user?.email) {
    // Email sending handled separately based on notification type
  }

  return notification;
};

/**
 * Send booking notification
 * @param {Object} booking - Booking object
 * @param {string} type - Notification type
 * @returns {Promise<void>}
 */
export const sendBookingNotification = async (booking, type) => {
  const notifications = [];

  switch (type) {
    case 'created':
      // Notify provider about new booking
      notifications.push({
        user: booking.provider,
        type: 'booking',
        title: 'New Booking Request',
        message: `You have a new booking for ${booking.service?.title}`,
        data: { bookingId: booking._id, status: 'pending' },
        booking: booking._id,
        priority: 'high'
      });

      // Notify customer (confirmation)
      notifications.push({
        user: booking.customer,
        type: 'booking',
        title: 'Booking Created',
        message: `Your booking for ${booking.service?.title} has been created`,
        data: { bookingId: booking._id, status: 'pending' },
        booking: booking._id,
        priority: 'medium'
      });
      break;

    case 'accepted':
      notifications.push({
        user: booking.customer,
        type: 'booking',
        title: 'Booking Accepted',
        message: `Your booking has been accepted by ${booking.provider?.name}`,
        data: { bookingId: booking._id, status: 'accepted' },
        booking: booking._id,
        priority: 'high'
      });
      break;

    case 'rejected':
      notifications.push({
        user: booking.customer,
        type: 'booking',
        title: 'Booking Rejected',
        message: `Your booking has been rejected`,
        data: { bookingId: booking._id, status: 'rejected' },
        booking: booking._id,
        priority: 'urgent'
      });
      break;

    case 'completed':
      notifications.push({
        user: booking.customer,
        type: 'booking',
        title: 'Booking Completed',
        message: `Your booking has been marked as completed`,
        data: { bookingId: booking._id, status: 'completed' },
        booking: booking._id,
        priority: 'medium'
      });
      break;

    case 'cancelled':
      notifications.push({
        user: booking.customer,
        type: 'booking',
        title: 'Booking Cancelled',
        message: `Your booking has been cancelled`,
        data: { bookingId: booking._id, status: 'cancelled' },
        booking: booking._id,
        priority: 'high'
      });

      notifications.push({
        user: booking.provider,
        type: 'booking',
        title: 'Booking Cancelled',
        message: `Booking was cancelled by customer`,
        data: { bookingId: booking._id, status: 'cancelled' },
        booking: booking._id,
        priority: 'medium'
      });
      break;
  }

  // Create all notifications
  for (const notifData of notifications) {
    await createNotification(notifData);
  }

  logger.info(`Booking notifications sent for ${booking._id}`);
};

/**
 * Send payment notification
 * @param {Object} payment - Payment object
 * @param {string} type - Notification type
 * @returns {Promise<void>}
 */
export const sendPaymentNotification = async (payment, type) => {
  switch (type) {
    case 'completed':
      await createNotification({
        user: payment.customer,
        type: 'payment',
        title: 'Payment Successful',
        message: `Your payment of $${payment.amount} has been processed`,
        data: { paymentId: payment._id, amount: payment.amount },
        payment: payment._id,
        priority: 'high'
      });

      await createNotification({
        user: payment.provider,
        type: 'payment',
        title: 'Payment Received',
        message: `You received a payment of $${payment.amount}`,
        data: { paymentId: payment._id, amount: payment.amount },
        payment: payment._id,
        priority: 'medium'
      });
      break;

    case 'refunded':
      await createNotification({
        user: payment.customer,
        type: 'payment',
        title: 'Refund Processed',
        message: `Your refund of $${payment.amount} has been processed`,
        data: { paymentId: payment._id, amount: payment.amount },
        payment: payment._id,
        priority: 'high'
      });
      break;
  }
};

/**
 * Send review notification
 * @param {Object} review - Review object
 * @returns {Promise<void>}
 */
export const sendReviewNotification = async (review) => {
  await createNotification({
    user: review.provider,
    type: 'review',
    title: 'New Review Received',
    message: `You received a ${review.rating}-star review`,
    data: { reviewId: review._id, rating: review.rating },
    service: review.service,
    priority: 'medium'
  });
};

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getUserNotifications = async (userId, options = {}) => {
  return await notificationRepository.getUserNotifications(userId, options);
};

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const getUnreadCount = async (userId) => {
  return await notificationRepository.getUnreadCount(userId);
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.findById(notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  return await notificationRepository.markAsRead(notificationId);
};

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await notificationRepository.findById(notificationId);

  if (!notification || notification.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  await notificationRepository.deleteById(notificationId);
  return { message: 'Notification deleted' };
};

/**
 * Delete all read notifications
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const deleteReadNotifications = async (userId) => {
  await notificationRepository.deleteRead(userId);
  return { message: 'Read notifications deleted' };
};
