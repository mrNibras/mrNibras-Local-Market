import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as userService from './user.service.js';
import { paginationValidator } from '../../shared/utils/validators.js';
import logger from '../../shared/utils/logger.js';

/**
 * User Controller
 * Handles HTTP requests for user operations
 */

/**
 * Register a new user
 * POST /api/users/register
 */
export const register = asyncHandler(async (req, res) => {
  const userData = req.body;

  const user = await userService.register(userData);

  logger.info(`User registered successfully: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: user
  });
});

/**
 * Login user
 * POST /api/users/login
 * Note: This is handled by auth module, kept here for reference
 */
export const login = asyncHandler(async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Please use /api/auth/login for authentication'
  });
});

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Update user profile
 * PATCH /api/users/:id
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

/**
 * Update current user profile
 * PATCH /api/users/me
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(
    req.user.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

/**
 * Change password
 * POST /api/users/:id/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(req.params.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Delete user account
 * DELETE /api/users/:id
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    ...users
  });
});

/**
 * Find users near location
 * GET /api/users/near
 */
export const findNearLocation = asyncHandler(async (req, res) => {
  const { lng, lat, maxDistance = 5000 } = req.query;

  if (!lng || !lat) {
    return res.status(400).json({
      success: false,
      message: 'Longitude and latitude are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const users = await userService.findNearLocation(
    [parseFloat(lng), parseFloat(lat)],
    parseInt(maxDistance)
  );

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

/**
 * Upgrade user to provider
 * POST /api/users/:id/upgrade-provider
 */
export const upgradeToProvider = asyncHandler(async (req, res) => {
  const user = await userService.upgradeToProvider(
    req.params.id,
    req.body.providerInfo || {}
  );

  res.status(200).json({
    success: true,
    message: 'User upgraded to provider successfully',
    data: user
  });
});

/**
 * Verify user (Admin only)
 * PATCH /api/users/:id/verify
 */
export const verifyUser = asyncHandler(async (req, res) => {
  const { isVerified = true } = req.body;
  
  const user = await userService.verifyUser(req.params.id, isVerified);

  res.status(200).json({
    success: true,
    message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
    data: user
  });
});

/**
 * Get user statistics (Admin only)
 * GET /api/users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});
