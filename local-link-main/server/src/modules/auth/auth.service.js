import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import envVars from '../../config/env.js';
import * as userRepository from '../users/user.repository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from './auth.utils.js';
import { NotFoundError, BadRequestError, ConflictError, UnauthorizedError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

// Re-export for use in controllers
export { generateAccessToken, generateRefreshToken, verifyAccessToken };

/**
 * Auth Service
 * Handles authentication and token management
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>}
 */
export const register = async (userData) => {
  const { email, password, role = 'customer' } = userData;

  // Check if user already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(envVars.BCRYPT_ROUNDS));

  // Create user
  const user = await userRepository.createUser({
    ...userData,
    password: hashedPassword,
    role
  });

  logger.info(`New user registered: ${email} (ID: ${user._id})`);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };
};

/**
 * Login user and generate tokens
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>}
 */
export const login = async (email, password) => {
  // Find user with password
  const user = await userRepository.findByEmail(email, true);

  if (!user) {
    throw new BadRequestError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken({ id: user._id });

  // Store refresh token
  await storeRefreshToken(user._id, refreshToken);

  logger.info(`User logged in: ${email}`);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage
    },
    accessToken,
    refreshToken,
    expiresIn: '15m',
    refreshExpiresIn: '7d'
  };
};

/**
 * Store refresh token in database
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<void>}
 */
export const storeRefreshToken = async (userId, refreshToken) => {
  // Hash the refresh token for security
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await userRepository.updateById(userId, {
    refreshToken: hashedToken,
    refreshTokenExpiresAt: expiresAt
  });
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>}
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Get user with stored refresh token
    const user = await userRepository.findByIdWithPassword(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }

    // Verify refresh token matches
    if (!user.refreshToken || user.refreshToken !== hashedToken) {
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Check if refresh token is expired
    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Optional: Rotate refresh token (issue new one)
    const newRefreshToken = generateRefreshToken({ id: user._id });
    await storeRefreshToken(user._id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: '15m',
      refreshExpiresIn: '7d'
    };
  } catch (error) {
    if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'INVALID_REFRESH_TOKEN') {
      throw error;
    }
    throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
};

/**
 * Logout user (invalidate refresh token)
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const logout = async (userId) => {
  await userRepository.updateById(userId, {
    refreshToken: null,
    refreshTokenExpiresAt: null
  });

  logger.info(`User logged out: ${userId}`);

  return { message: 'Logged out successfully' };
};

/**
 * Logout from all devices (invalidate all refresh tokens)
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const logoutAll = async (userId) => {
  await userRepository.updateById(userId, {
    refreshToken: null,
    refreshTokenExpiresAt: null
  });

  logger.info(`User logged out from all devices: ${userId}`);

  return { message: 'Logged out from all devices successfully' };
};

/**
 * Get current authenticated user
 * @param {string} userId - User ID from token
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async (userId) => {
  return await userRepository.findById(userId, {
    select: '-password -refreshToken -refreshTokenExpiresAt',
    populate: ['services', 'bookingsAsCustomer', 'bookingsAsProvider']
  });
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
export const requestPasswordReset = async (email) => {
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If the email exists, a reset link has been sent' };
  }

  // Generate reset token (6-digit code)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  
  // Store hashed code with expiry (15 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  await userRepository.updateById(user._id, {
    passwordResetCode: hashedCode,
    passwordResetExpires: expiresAt
  });

  // TODO: Send email with reset code
  // await emailService.sendPasswordReset(user.email, resetCode);
  logger.info(`Password reset requested for: ${email}. Code: ${resetCode}`);

  return { message: 'If the email exists, a reset code has been sent' };
};

/**
 * Reset password with code
 * @param {string} email - User email
 * @param {string} code - Reset code
 * @param {string} newPassword - New password
 * @returns {Promise<Object>}
 */
export const resetPassword = async (email, code, newPassword) => {
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  
  const user = await userRepository.findByEmail(email, true);
  
  if (!user || !user.passwordResetCode || user.passwordResetCode !== hashedCode) {
    throw new BadRequestError('Invalid reset code', 'INVALID_RESET_CODE');
  }

  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    throw new BadRequestError('Reset code expired', 'RESET_CODE_EXPIRED');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, parseInt(envVars.BCRYPT_ROUNDS));

  // Update password and clear reset fields
  await userRepository.updateById(user._id, {
    password: hashedPassword,
    passwordResetCode: null,
    passwordResetExpires: null,
    refreshToken: null,
    refreshTokenExpiresAt: null
  });

  logger.info(`Password reset completed for: ${email}`);

  return { message: 'Password reset successfully' };
};
