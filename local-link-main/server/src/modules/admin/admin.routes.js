import express from 'express';
import * as adminController from './admin.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import { paginationValidator } from '../../shared/utils/validators.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard and overview
router.get('/dashboard', adminController.getDashboard);
router.get('/activities', adminController.getActivities);
router.get('/health', adminController.getHealth);
router.get('/analytics', adminController.getAnalytics);

// Pending bookings
router.get('/pending-bookings', adminController.getPendingBookings);

// Reports
router.get('/reports', adminController.getReports);

// User management
router.get('/users/:role', adminController.getUsersByRole);
router.delete('/users/:id', adminController.deleteUser);

// Service management
router.get('/services/category/:category', adminController.getServicesByCategory);
router.delete('/services/:id', adminController.deleteService);

// Booking management
router.get('/bookings', paginationValidator, adminController.getAllBookings);

// Review management
router.get('/reviews', paginationValidator, adminController.getAllReviews);

export default router;
