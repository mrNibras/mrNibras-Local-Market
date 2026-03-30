import Chat from './chat.model.js';
import Message from './message.model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Chat Service
 * Handles chat operations and messaging
 */

/**
 * Get or create chat
 * @param {Array} participants - User IDs
 * @param {Object} relatedEntity - Related booking/offer/service
 * @param {string} initiatorId - User creating the chat
 * @returns {Promise<Object>}
 */
export const getOrCreateChat = async (participants, relatedEntity = {}, initiatorId) => {
  // Validate participants
  if (!participants || participants.length < 2) {
    throw new BadRequestError('Chat must have at least 2 participants', 'INVALID_PARTICIPANTS');
  }

  // Check if user is a participant
  if (!participants.includes(initiatorId)) {
    throw new ForbiddenError('You must be a participant to create/join chat', 'NOT_PARTICIPANT');
  }

  const chat = await Chat.findOrCreateChat(participants, relatedEntity);

  return await Chat.findById(chat._id)
    .populate('participants', 'name email profileImage')
    .populate('booking', 'status bookingDate')
    .populate('offer', 'status proposedPrice')
    .populate('service', 'title');
};

/**
 * Send message
 * @param {string} chatId - Chat ID
 * @param {string} senderId - Sender ID
 * @param {string} content - Message content
 * @param {string} type - Message type
 * @returns {Promise<Object>}
 */
export const sendMessage = async (chatId, senderId, content, type = 'text') => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new NotFoundError('Chat not found', 'CHAT_NOT_FOUND');
  }

  // Verify sender is a participant
  const isParticipant = chat.participants.some(p => p.toString() === senderId);
  if (!isParticipant) {
    throw new ForbiddenError('Not authorized to send messages in this chat', 'NOT_PARTICIPANT');
  }

  // Create message
  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    content,
    type,
    readBy: [senderId]
  });

  // Populate message
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email profileImage');

  logger.info(`Message sent in chat ${chatId} by ${senderId}`);

  return populatedMessage;
};

/**
 * Get chat messages
 * @param {string} chatId - Chat ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getMessages = async (chatId, options = {}) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new NotFoundError('Chat not found', 'CHAT_NOT_FOUND');
  }

  const messages = await Message.getMessages(chatId, options);

  return {
    chat: chatId,
    count: messages.length,
    data: messages
  };
};

/**
 * Get user chats
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getUserChats = async (userId, options = {}) => {
  return await Chat.getUserChats(userId, options);
};

/**
 * Mark messages as read
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const markAsRead = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new NotFoundError('Chat not found', 'CHAT_NOT_FOUND');
  }

  await Message.markAsRead(chatId, userId);

  return { success: true, message: 'Messages marked as read' };
};

/**
 * Edit message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID (must be sender)
 * @param {string} newContent - New content
 * @returns {Promise<Object>}
 */
export const editMessage = async (messageId, userId, newContent) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
  }

  if (message.sender.toString() !== userId) {
    throw new ForbiddenError('Can only edit your own messages', 'NOT_AUTHORIZED');
  }

  await message.edit(newContent);

  return message;
};

/**
 * Delete message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID (must be sender)
 * @returns {Promise<Object>}
 */
export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
  }

  if (message.sender.toString() !== userId) {
    throw new ForbiddenError('Can only delete your own messages', 'NOT_AUTHORIZED');
  }

  await message.delete();

  return { success: true, message: 'Message deleted' };
};

/**
 * Get unread count
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getUnreadCount = async (userId) => {
  const chats = await Chat.find({ participants: userId });
  
  let totalUnread = 0;
  
  for (const chat of chats) {
    const count = await Message.countDocuments({
      chat: chat._id,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    });
    totalUnread += count;
  }
  
  return { totalUnread };
};

/**
 * Create system message
 * @param {string} chatId - Chat ID
 * @param {string} content - System message content
 * @returns {Promise<Object>}
 */
export const createSystemMessage = async (chatId, content) => {
  const message = await Message.create({
    chat: chatId,
    sender: null, // System message
    content,
    type: 'system',
    readBy: []
  });

  return message;
};
