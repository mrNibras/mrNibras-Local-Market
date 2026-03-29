import express from 'express';
import * as availabilityController from './availability.controller.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import {
  createAvailabilityValidator,
  availabilityIdParam
} from '../../shared/utils/validators.js';

const router = express.Router();

// All availability routes require authentication and provider role
router.use(protect);
router.use(restrictTo('provider', 'admin'));

// Get my availability
router.get('/my-availability', availabilityController.getMyAvailability);

// Get availability by ID
router.get('/:id', availabilityIdParam, availabilityController.getAvailabilityById);

// Get availability for a specific day
router.get('/day/:dayOfWeek', availabilityController.getDayAvailability);

// Get available slots for a day
router.get('/day/:dayOfWeek/slots', availabilityController.getAvailableSlots);

// Create availability
router.post('/', createAvailabilityValidator, availabilityController.createAvailability);

// Update availability
router.patch('/:id', availabilityIdParam, availabilityController.updateAvailability);

// Delete availability
router.delete('/:id', availabilityIdParam, availabilityController.deleteAvailability);

// Toggle active status
router.patch('/:id/toggle-active', availabilityIdParam, availabilityController.toggleActive);

// Set exception availability
router.post('/exception', availabilityController.setException);

// Get exceptions for date range
router.get('/exceptions', availabilityController.getExceptions);

// Check slot availability
router.get('/check-slot', availabilityController.checkSlotAvailability);

// Book a slot
router.post('/:id/book', availabilityIdParam, availabilityController.bookSlot);

// Cancel a slot
router.post('/:id/cancel-slot', availabilityIdParam, availabilityController.cancelSlot);

// Delete all availability
router.delete('/all', availabilityController.deleteAllAvailability);

export default router;
