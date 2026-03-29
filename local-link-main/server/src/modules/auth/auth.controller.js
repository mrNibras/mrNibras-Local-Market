import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as authService from './auth.service.js';
import { loginValidator } from '../../shared/utils/validators.js';
import logger from '../../shared/utils/logger.js';

/**
 * Auth Controller
 * Handles authentication HTTP requests
 */

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * Register and login (convenience endpoint)
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const userData = req.body;

  // Register user
  const user = await authService.authService.register(userData);
  
  // Generate token
  const token = authService.generateToken(user);

  logger.info(`User registered and logged in: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      token,
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  });
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      errorCode: 'NO_TOKEN'
    });
  }

  const result = await authService.refreshToken(token);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const result = await authService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * Verify token (for debugging/testing)
 * POST /api/auth/verify-token
 */
export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No token provided'
    });
  }

  const decoded = authService.verifyToken(token);

  res.status(200).json({
    success: true,
    data: decoded
  });
});
