import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as notificationService from './notification.service.js';

/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */

/**
 * Get user notifications
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...notifications
  });
});

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

/**
 * Mark all as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

/**
 * Delete all read notifications
 * DELETE /api/notifications/read
 */
export const deleteReadNotifications = asyncHandler(async (req, res) => {
  await notificationService.deleteReadNotifications(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Read notifications deleted'
  });
});
