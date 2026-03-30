import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as chatService from './chat.service.js';
import { getIO, emitToUser } from './chat.socket.js';
import logger from '../../shared/utils/logger.js';

/**
 * Chat Controller
 * Handles HTTP requests for chat operations
 */

/**
 * Get or create chat
 * POST /api/chat
 */
export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { participants, booking, offer, service } = req.body;

  const chat = await chatService.getOrCreateChat(
    participants,
    { booking, offer, service },
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: chat
  });
});

/**
 * Get user chats
 * GET /api/chat
 */
export const getUserChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getUserChats(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...chats
  });
});

/**
 * Get chat messages
 * GET /api/chat/:chatId/messages
 */
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.params.chatId, req.query);

  res.status(200).json({
    success: true,
    ...messages
  });
});

/**
 * Send message
 * POST /api/chat/:chatId/messages
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'text' } = req.body;

  const message = await chatService.sendMessage(
    req.params.chatId,
    req.user.id,
    content,
    type
  );

  // Emit via Socket.io
  try {
    const io = getIO();
    io.to(`chat:${req.params.chatId}`).emit('newMessage', {
      chatId: req.params.chatId,
      message
    });
  } catch (error) {
    logger.warn(`Socket.io not available: ${error.message}`);
  }

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: message
  });
});

/**
 * Mark messages as read
 * PATCH /api/chat/:chatId/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  await chatService.markAsRead(req.params.chatId, req.user.id);

  // Emit via Socket.io
  try {
    const io = getIO();
    io.to(`chat:${req.params.chatId}`).emit('messagesRead', {
      chatId: req.params.chatId,
      userId: req.user.id
    });
  } catch (error) {
    logger.warn(`Socket.io not available: ${error.message}`);
  }

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
});

/**
 * Edit message
 * PATCH /api/chat/messages/:messageId
 */
export const editMessage = asyncHandler(async (req, res) => {
  const message = await chatService.editMessage(
    req.params.messageId,
    req.user.id,
    req.body.content
  );

  // Emit via Socket.io
  try {
    const io = getIO();
    io.to(`chat:${message.chat}`).emit('messageEdited', {
      messageId: req.params.messageId,
      content: req.body.content,
      edited: true
    });
  } catch (error) {
    logger.warn(`Socket.io not available: ${error.message}`);
  }

  res.status(200).json({
    success: true,
    message: 'Message edited',
    data: message
  });
});

/**
 * Delete message
 * DELETE /api/chat/messages/:messageId
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const result = await chatService.deleteMessage(
    req.params.messageId,
    req.user.id
  );

  res.status(200).json(result);
});

/**
 * Get unread count
 * GET /api/chat/unread-count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await chatService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});
