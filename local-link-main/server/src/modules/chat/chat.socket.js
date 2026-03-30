import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import envVars from '../../config/env.js';
import * as chatService from './chat.service.js';
import logger from '../../shared/utils/logger.js';

/**
 * Socket.io Server Setup
 * Handles real-time communication
 */

let io;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io instance
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: envVars.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, envVars.JWT_SECRET, {
        issuer: envVars.JWT_ISSUER
      });

      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      logger.warn(`Socket authentication error: ${error.message}`);
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${socket.user.id}`);

    // ==================== Chat Events ====================

    // Join chat room
    socket.on('joinChat', async (chatId) => {
      try {
        const chat = await chatService.getChat(chatId);
        
        // Verify user is participant
        const isParticipant = chat.participants.some(
          p => p._id.toString() === socket.user.id
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }

        socket.join(`chat:${chatId}`);
        logger.info(`User ${socket.user.id} joined chat ${chatId}`);

        // Notify others
        socket.to(`chat:${chatId}`).emit('userJoined', {
          chatId,
          userId: socket.user.id
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      socket.to(`chat:${chatId}`).emit('userLeft', {
        chatId,
        userId: socket.user.id
      });
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, type = 'text' } = data;

        const message = await chatService.sendMessage(
          chatId,
          socket.user.id,
          content,
          type
        );

        // Broadcast to chat room
        io.to(`chat:${chatId}`).emit('newMessage', {
          chatId,
          message
        });

        // Send notification to offline participants
        const chat = await chatService.getChat(chatId);
        chat.participants.forEach(participant => {
          if (participant._id.toString() !== socket.user.id) {
            io.to(`user:${participant._id}`).emit('notification', {
              type: 'message',
              chatId,
              from: socket.user.id,
              message: content
            });
          }
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('typing', {
        chatId,
        userId: socket.user.id,
        userName: socket.user.email
      });
    });

    // Stop typing
    socket.on('stopTyping', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('stopTyping', {
        chatId,
        userId: socket.user.id
      });
    });

    // Mark messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { chatId } = data;
        await chatService.markAsRead(chatId, socket.user.id);

        socket.to(`chat:${chatId}`).emit('messagesRead', {
          chatId,
          userId: socket.user.id
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Edit message
    socket.on('editMessage', async (data) => {
      try {
        const { messageId, content } = data;
        const message = await chatService.editMessage(messageId, socket.user.id, content);

        io.to(`chat:${message.chat}`).emit('messageEdited', {
          messageId,
          content,
          edited: true
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Delete message
    socket.on('deleteMessage', async (data) => {
      try {
        const { messageId } = data;
        const message = await chatService.deleteMessage(messageId, socket.user.id);

        io.to(`chat:${message.chat}`).emit('messageDeleted', {
          messageId
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ==================== Offer Events ====================

    socket.on('offerCreated', async (data) => {
      const { offerId, providerId } = data;
      io.to(`user:${providerId}`).emit('offerNotification', {
        type: 'offer_created',
        offerId
      });
    });

    socket.on('offerResponse', async (data) => {
      const { offerId, customerId, action } = data;
      io.to(`user:${customerId}`).emit('offerNotification', {
        type: 'offer_response',
        offerId,
        action
      });
    });

    // ==================== Booking Events ====================

    socket.on('bookingUpdate', async (data) => {
      const { bookingId, userId, status } = data;
      io.to(`user:${userId}`).emit('bookingNotification', {
        type: 'booking_update',
        bookingId,
        status
      });
    });

    // ==================== Presence ====================

    socket.on('setOnline', () => {
      socket.broadcast.emit('userOnline', {
        userId: socket.user.id
      });
    });

    socket.on('setOffline', () => {
      socket.broadcast.emit('userOffline', {
        userId: socket.user.id
      });
    });

    // ==================== Disconnect ====================

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id} (${socket.id})`);
      socket.broadcast.emit('userOffline', {
        userId: socket.user.id
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });

  logger.info('Socket.io server initialized');

  return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to chat room
 * @param {string} chatId - Chat ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToChat = (chatId, event, data) => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};

/**
 * Broadcast event to all users
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
