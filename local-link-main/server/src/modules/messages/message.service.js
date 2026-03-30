import Message from './message.model.js';
import { NotFoundError, BadRequestError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Messages Service
 * Handles messaging between users
 */

/**
 * Send a message
 * @param {Object} messageData - Message data
 * @param {string} senderId - Sender ID
 * @returns {Promise<Object>}
 */
export const sendMessage = async (messageData, senderId) => {
  const { recipient, service, content, subject, messageType = 'inquiry' } = messageData;

  // Validate content
  if (!content || content.trim().length < 5) {
    throw new BadRequestError('Message must be at least 5 characters', 'MESSAGE_TOO_SHORT');
  }

  // Create message
  const message = await Message.create({
    sender: senderId,
    recipient,
    service,
    content,
    subject,
    messageType
  });

  // Populate message with sender and recipient info
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .populate('service', 'title');

  logger.info(`Message sent from ${senderId} to ${recipient}`);

  return populatedMessage;
};

/**
 * Get user's messages
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getUserMessages = async (userId, options = {}) => {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const messages = await Message.getUserMessages(userId, {
    page,
    limit,
    unreadOnly
  });

  const total = await Message.countDocuments({
    recipient: userId,
    ...(unreadOnly && { isRead: false })
  });

  return {
    data: messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getConversation = async (userId1, userId2, options = {}) => {
  const { page = 1, limit = 50 } = options;

  const messages = await Message.getConversation(userId1, userId2, {
    page,
    limit
  });

  return {
    data: messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  };
};

/**
 * Mark message as read
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID (recipient)
 * @returns {Promise<Object>}
 */
export const markAsRead = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
  }

  if (message.recipient.toString() !== userId) {
    throw new BadRequestError('Not authorized to mark this message as read', 'NOT_AUTHORIZED');
  }

  await message.markAsRead();

  return message;
};

/**
 * Mark all messages as read
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const markAllAsRead = async (userId) => {
  await Message.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { success: true };
};

/**
 * Get unread count
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const getUnreadCount = async (userId) => {
  return await Message.countDocuments({
    recipient: userId,
    isRead: false
  });
};

/**
 * Delete message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
  }

  // Only sender can delete
  if (message.sender.toString() !== userId) {
    throw new BadRequestError('Not authorized to delete this message', 'NOT_AUTHORIZED');
  }

  await Message.findByIdAndDelete(messageId);

  return { success: true };
};
