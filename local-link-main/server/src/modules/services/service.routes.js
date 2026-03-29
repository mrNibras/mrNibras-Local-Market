import express from 'express';
import * as serviceController from './service.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import {
  createServiceValidator,
  updateServiceValidator,
  serviceIdParam,
  paginationValidator,
  mongoIdParam
} from '../../shared/utils/validators.js';

const router = express.Router();

// Public routes - anyone can view services
router.get('/', paginationValidator, serviceController.getAllServices);
router.get('/categories', serviceController.getCategories);
router.get('/near', serviceController.findServicesNearLocation);
router.get('/search', serviceController.searchServices);
router.get('/category/:category', paginationValidator, serviceController.getServicesByCategory);
router.get('/provider/:providerId', paginationValidator, serviceController.getServicesByProvider);
router.get('/:id', serviceIdParam, serviceController.getServiceById);
router.get('/:id/stats', serviceIdParam, serviceController.getServiceStats);

// Protected routes - require authentication
router.use(protect);

// Get my services
router.get('/my-services', serviceController.getMyServices);

// Create service (Provider only)
router.post('/', restrictTo('provider', 'admin'), createServiceValidator, serviceController.createService);

// Update, delete, toggle (Owner or Admin only)
router
  .route('/:id')
  .patch(restrictTo('provider', 'admin'), updateServiceValidator, serviceController.updateService)
  .delete(restrictTo('provider', 'admin'), serviceController.deleteService);

// Toggle active status
router.patch('/:id/toggle-active', restrictTo('provider', 'admin'), serviceController.toggleServiceActive);

export default router;
