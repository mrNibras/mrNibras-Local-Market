import express from 'express';
import * as userController from './user.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import {
  registerValidator,
  updateProfileValidator,
  paginationValidator,
  mongoIdParam
} from '../../shared/utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, userController.register);

// Protected routes
router.use(protect); // All routes below require authentication

// Current user routes
router.get('/me', userController.getProfile);
router.patch('/me', updateProfileValidator, userController.updateMyProfile);

// Get all users (Admin only)
router.get('/', restrictTo('admin'), paginationValidator, userController.getAllUsers);

// User statistics (Admin only)
router.get('/stats', restrictTo('admin'), userController.getUserStats);

// Find users near location
router.get('/near', userController.findNearLocation);

// User-specific routes
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(updateProfileValidator, userController.updateProfile)
  .delete(restrictTo('admin', 'customer', 'provider'), userController.deleteAccount);

// Change password
router.post('/:id/change-password', mongoIdParam, userController.changePassword);

// Verify user (Admin only)
router.patch('/:id/verify', restrictTo('admin'), mongoIdParam, userController.verifyUser);

// Upgrade to provider
router.post('/:id/upgrade-provider', restrictTo('admin'), mongoIdParam, userController.upgradeToProvider);

export default router;
