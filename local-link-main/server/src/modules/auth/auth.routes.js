import express from 'express';
import * as authController from './auth.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { loginValidator, registerValidator } from '../../shared/utils/validators.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidator, authController.login);
router.post('/register', registerValidator, authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAll);
router.get('/me', protect, authController.getCurrentUser);

// Debug/test route (remove in production)
router.post('/verify-token', authController.verifyToken);

export default router;
