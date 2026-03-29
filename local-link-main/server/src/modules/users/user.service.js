import bcrypt from 'bcryptjs';
import envVars from '../../config/env.js';
import * as userRepository from './user.repository.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * User Service
 * Contains business logic for user operations
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
 * Authenticate user (login)
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

  logger.info(`User logged in: ${email}`);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profileImage: user.profileImage
  };
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getProfile = async (userId) => {
  const user = await userRepository.findById(userId, {
    populate: ['services', 'bookingsAsCustomer', 'bookingsAsProvider']
  });

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} requesterId - ID of the user making the request
 * @returns {Promise<Object>}
 */
export const updateProfile = async (userId, updateData, requesterId) => {
  // Check authorization
  if (userId !== requesterId) {
    throw new ForbiddenError('You can only update your own profile', 'NOT_AUTHORIZED');
  }

  // Check if email is being changed and if it already exists
  if (updateData.email) {
    const existingUser = await userRepository.findByEmail(updateData.email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ConflictError('Email already in use', 'EMAIL_EXISTS');
    }
  }

  const user = await userRepository.updateById(userId, updateData);

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  logger.info(`User profile updated: ${userId}`);

  return user;
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>}
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Get user with password
  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new BadRequestError('Current password is incorrect', 'INVALID_PASSWORD');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, parseInt(envVars.BCRYPT_ROUNDS));

  // Update password
  const updatedUser = await userRepository.updateById(userId, { password: hashedPassword });

  logger.info(`Password changed for user: ${userId}`);

  return { message: 'Password changed successfully' };
};

/**
 * Delete user account
 * @param {string} userId - User ID
 * @param {string} requesterId - ID of the user making the request
 * @returns {Promise<Object>}
 */
export const deleteAccount = async (userId, requesterId) => {
  // Check authorization (user can delete own account or admin can delete any)
  const user = await userRepository.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  // Only admin or the user themselves can delete
  if (userId !== requesterId && user.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own account', 'NOT_AUTHORIZED');
  }

  await userRepository.deleteById(userId);

  logger.info(`User account deleted: ${userId}`);

  return { message: 'Account deleted successfully' };
};

/**
 * Find users near a location
 * @param {Array} coordinates - [longitude, latitude]
 * @param {number} maxDistance - Max distance in meters
 * @returns {Promise<Array>}
 */
export const findNearLocation = async (coordinates, maxDistance = 5000) => {
  const users = await userRepository.findNearLocation(coordinates, maxDistance);
  return users.map(user => ({
    id: user._id,
    name: user.name,
    role: user.role,
    location: user.location,
    distance: user.distance
  }));
};

/**
 * Get all users with pagination and filtering
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getAllUsers = async (queryParams) => {
  const { role, isVerified, page, limit, sort } = queryParams;

  const filter = {};
  if (role) filter.role = role;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

  const result = await userRepository.findAll(filter, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-createdAt',
    select: '-password'
  });

  return result;
};

/**
 * Verify a user (admin only)
 * @param {string} userId - User ID
 * @param {boolean} isVerified - Verification status
 * @returns {Promise<Object>}
 */
export const verifyUser = async (userId, isVerified = true) => {
  const user = await userRepository.updateVerificationStatus(userId, isVerified);

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  logger.info(`User verification status updated: ${userId} -> ${isVerified}`);

  return user;
};

/**
 * Get user statistics
 * @returns {Promise<Object>}
 */
export const getUserStats = async () => {
  return await userRepository.getStats();
};

/**
 * Upgrade user to provider role
 * @param {string} userId - User ID
 * @param {Object} providerInfo - Provider information
 * @returns {Promise<Object>}
 */
export const upgradeToProvider = async (userId, providerInfo = {}) => {
  const user = await userRepository.updateById(userId, {
    role: 'provider',
    providerInfo
  });

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  logger.info(`User upgraded to provider: ${userId}`);

  return user;
};
