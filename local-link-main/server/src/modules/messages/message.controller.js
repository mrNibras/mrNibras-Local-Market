import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as messageService from './message.service.js';
import logger from '../../shared/utils/logger.js';

/**
 * Messages Controller
 * Handles HTTP requests for messaging
 */

/**
 * Send a message
 * POST /api/messages
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { recipient, service, content, subject, messageType } = req.body;

  const message = await messageService.sendMessage(
    { recipient, service, content, subject, messageType },
    req.user.id
  );

  logger.info(`Message sent: ${message._id}`);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: message
  });
});

/**
 * Get my messages
 * GET /api/messages
 */
export const getMyMessages = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;

  const messages = await messageService.getUserMessages(req.user.id, {
    page: page || 1,
    limit: limit || 20,
    unreadOnly: unreadOnly === 'true'
  });

  res.status(200).json({
    success: true,
    ...messages
  });
});

/**
 * Get unread count
 * GET /api/messages/unread-count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

/**
 * Mark message as read
 * PATCH /api/messages/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  await messageService.markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Message marked as read'
  });
});

/**
 * Mark all as read
 * PATCH /api/messages/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await messageService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All messages marked as read'
  });
});

/**
 * Delete message
 * DELETE /api/messages/:id
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  await messageService.deleteMessage(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Message deleted'
  });
});

/**
 * Get conversation with another user
 * GET /api/messages/conversation/:userId
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const conversation = await messageService.getConversation(
    req.user.id,
    req.params.userId,
    {
      page: page || 1,
      limit: limit || 50
    }
  );

  res.status(200).json({
    success: true,
    ...conversation
  });
});
