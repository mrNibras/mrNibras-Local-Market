import express from 'express';
import * as notificationController from './notification.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Delete all read
router.delete('/read', notificationController.deleteReadNotifications);

export default router;
