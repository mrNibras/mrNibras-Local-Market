import jwt from 'jsonwebtoken';
import envVars from '../../config/env.js';
import logger from '../utils/logger.js';

/**
 * Protect routes - Verify JWT token
 * Attaches decoded user info to req.user
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn('Access denied - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
        errorCode: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, envVars.JWT_SECRET, {
        issuer: envVars.JWT_ISSUER
      });

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        logger.warn('Access denied - Token expired');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Token expired',
          errorCode: 'TOKEN_EXPIRED'
        });
      }

      logger.warn(`Access denied - Invalid token: ${jwtError.message}`);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token',
        errorCode: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Optional authentication - attaches user if token valid, continues if not
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, envVars.JWT_SECRET, {
        issuer: envVars.JWT_ISSUER
      });

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      // Token invalid, but continue without user
    }
  }

  next();
};
