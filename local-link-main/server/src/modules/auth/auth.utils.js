import jwt from 'jsonwebtoken';
import envVars from '../../config/env.js';

/**
 * Generate JWT Access Token
 * Short-lived token for API requests (15 minutes)
 * @param {Object} user - User object
 * @returns {string}
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      role: user.role
    },
    envVars.JWT_SECRET,
    {
      expiresIn: '15m', // Short-lived access token
      issuer: envVars.JWT_ISSUER,
      subject: (user.id || user._id).toString()
    }
  );
};

/**
 * Generate JWT Refresh Token
 * Long-lived token for getting new access tokens (7 days)
 * @param {Object} user - User object
 * @returns {string}
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id
    },
    envVars.JWT_SECRET + '_refresh', // Different secret for refresh tokens
    {
      expiresIn: '7d', // Long-lived refresh token
      issuer: envVars.JWT_ISSUER,
      subject: (user.id || user._id).toString()
    }
  );
};

/**
 * Verify Access Token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, envVars.JWT_SECRET, {
      issuer: envVars.JWT_ISSUER
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('ACCESS_TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_ACCESS_TOKEN');
    }
    throw error;
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, envVars.JWT_SECRET + '_refresh', {
      issuer: envVars.JWT_ISSUER
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    throw error;
  }
};

/**
 * Legacy token generation (for backward compatibility)
 * @param {Object} user - User object
 * @returns {string}
 */
export const generateToken = generateAccessToken;

/**
 * Legacy token verification (for backward compatibility)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = verifyAccessToken;
