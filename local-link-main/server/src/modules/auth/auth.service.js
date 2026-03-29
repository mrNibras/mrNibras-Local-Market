import jwt from 'jsonwebtoken';
import envVars from '../../config/env.js';
import * as userService from '../users/user.service.js';
import { BadRequestError, UnauthorizedError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Auth Service
 * Handles authentication and token management
 */

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string}
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, envVars.JWT_SECRET, {
    expiresIn: envVars.JWT_EXPIRE,
    issuer: envVars.JWT_ISSUER,
    subject: user.id.toString()
  });

  return token;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, envVars.JWT_SECRET, {
      issuer: envVars.JWT_ISSUER
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }
    throw error;
  }
};

/**
 * Login user and generate token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>}
 */
export const login = async (email, password) => {
  const user = await userService.login(email, password);
  
  const token = generateToken(user);

  logger.info(`User authenticated: ${email}`);

  return {
    user,
    token,
    expiresIn: envVars.JWT_EXPIRE
  };
};

/**
 * Refresh token
 * @param {string} token - Current token
 * @returns {Promise<Object>}
 */
export const refreshToken = async (token) => {
  const decoded = verifyToken(token);
  
  // Get fresh user data
  const user = await userService.getProfile(decoded.id);
  
  // Generate new token
  const newToken = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  logger.info(`Token refreshed for user: ${decoded.email}`);

  return {
    token: newToken,
    expiresIn: envVars.JWT_EXPIRE
  };
};

/**
 * Logout user (for stateful logout, can be extended with token blacklist)
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const logout = async (userId) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // For stateful logout, you would add the token to a blacklist in Redis/DB
  
  logger.info(`User logged out: ${userId}`);
  
  return { message: 'Logged out successfully' };
};

/**
 * Get current authenticated user
 * @param {string} userId - User ID from token
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async (userId) => {
  return await userService.getProfile(userId);
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
export const requestPasswordReset = async (email) => {
  // Find user
  const user = await userService.getProfileByEmail(email);
  
  if (!user) {
    // Don't reveal if email exists or not
    return { message: 'If the email exists, a reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generateToken({ id: user._id, type: 'password_reset' });
  
  // TODO: Send email with reset token
  // await emailService.sendPasswordReset(user.email, resetToken);

  logger.info(`Password reset requested for: ${email}`);

  return { message: 'If the email exists, a reset link has been sent' };
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>}
 */
export const resetPassword = async (token, newPassword) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'password_reset') {
    throw new BadRequestError('Invalid reset token', 'INVALID_RESET_TOKEN');
  }

  await userService.changePassword(decoded.id, '', newPassword);

  logger.info(`Password reset completed for user: ${decoded.id}`);

  return { message: 'Password reset successfully' };
};
