import express from 'express';
import * as messageController from './message.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Send message
router.post('/', messageController.sendMessage);

// Get my messages
router.get('/', messageController.getMyMessages);

// Get unread count
router.get('/unread-count', messageController.getUnreadCount);

// Mark as read
router.patch('/:id/read', messageController.markAsRead);

// Mark all as read
router.patch('/read-all', messageController.markAllAsRead);

// Delete message
router.delete('/:id', messageController.deleteMessage);

// Get conversation with user
router.get('/conversation/:userId', messageController.getConversation);

export default router;
