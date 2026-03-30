import express from 'express';
import * as chatController from './chat.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get or create chat
router.post('/', chatController.getOrCreateChat);

// Get user chats
router.get('/', chatController.getUserChats);

// Get unread count
router.get('/unread-count', chatController.getUnreadCount);

// Chat-specific routes
router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.patch('/:chatId/read', chatController.markAsRead);

// Message-specific routes
router.patch('/messages/:messageId', chatController.editMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;
