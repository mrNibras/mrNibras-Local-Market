import logger from '../utils/logger.js';

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'provider')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('RBAC denied - No user in request');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Please log in first',
        errorCode: 'NO_USER'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`RBAC denied - User role '${req.user.role}' not in allowed roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * Check if user is the owner of a resource
 * @param {string} ownerIdField - Field name containing the owner ID (default: 'userId')
 */
export const isOwner = (ownerIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Please log in first',
        errorCode: 'NO_USER'
      });
    }

    const ownerId = req.params[ownerIdField] || req.body[ownerIdField];

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Bad request - Owner ID not found',
        errorCode: 'NO_OWNER_ID'
      });
    }

    if (req.user.id !== ownerId.toString() && req.user.role !== 'admin') {
      logger.warn(`Ownership check failed - User ${req.user.id} tried to access resource owned by ${ownerId}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You can only access your own resources',
        errorCode: 'NOT_OWNER'
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Admin check failed - User role: ${req.user?.role || 'undefined'}`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Admin access required',
      errorCode: 'ADMIN_REQUIRED'
    });
  }

  next();
};

/**
 * Check if user is a service provider
 */
export const isProvider = (req, res, next) => {
  if (!req.user || req.user.role !== 'provider') {
    logger.warn(`Provider check failed - User role: ${req.user?.role || 'undefined'}`);
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Service provider access required',
      errorCode: 'PROVIDER_REQUIRED'
    });
  }

  next();
};
