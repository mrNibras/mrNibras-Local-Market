import { body, param, query, validationResult } from 'express-validator';
import { BadRequestError } from '../middleware/error.middleware.js';

/**
 * Validation error handler middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    throw new BadRequestError(
      errorMessages.map(e => `${e.field}: ${e.message}`).join(', '),
      'VALIDATION_FAILED'
    );
  }
  
  next();
};

/* ==================== AUTH VALIDATORS ==================== */

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('role')
    .optional()
    .isIn(['customer', 'provider']).withMessage('Role must be customer or provider'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]{8,}$/).withMessage('Invalid phone number format'),
  
  validate
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]{8,}$/).withMessage('Invalid phone number format'),
  
  body('location')
    .optional()
    .custom(value => {
      if (!value.type || !value.coordinates) return false;
      if (value.type !== 'Point') return false;
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) return false;
      return true;
    }).withMessage('Location must be a valid GeoJSON Point'),
  
  validate
];

/* ==================== SERVICE VALIDATORS ==================== */

export const createServiceValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Service title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category must be 2-50 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('location')
    .optional()
    .custom(value => {
      if (!value) return true;
      if (!value.type || !value.coordinates) return false;
      if (value.type !== 'Point') return false;
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) return false;
      return true;
    }).withMessage('Location must be a valid GeoJSON Point'),
  
  validate
];

export const updateServiceValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Category must be 2-50 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('location')
    .optional()
    .custom(value => {
      if (!value) return true;
      if (!value.type || !value.coordinates) return false;
      if (value.type !== 'Point') return false;
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) return false;
      return true;
    }).withMessage('Location must be a valid GeoJSON Point'),
  
  validate
];

export const serviceIdParam = [
  param('id')
    .notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid service ID format'),
  validate
];

/* ==================== BOOKING VALIDATORS ==================== */

export const createBookingValidator = [
  body('provider')
    .notEmpty().withMessage('Provider ID is required')
    .isMongoId().withMessage('Invalid provider ID format'),
  
  body('service')
    .notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid service ID format'),
  
  body('bookingDate')
    .notEmpty().withMessage('Booking date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(value => {
      const date = new Date(value);
      if (date < new Date()) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  
  validate
];

export const updateBookingStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  validate
];

export const bookingIdParam = [
  param('id')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID format'),
  validate
];

/* ==================== REVIEW VALIDATORS ==================== */

export const createReviewValidator = [
  body('service')
    .notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid service ID format'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  
  validate
];

export const updateReviewValidator = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  
  validate
];

export const reviewIdParam = [
  param('id')
    .notEmpty().withMessage('Review ID is required')
    .isMongoId().withMessage('Invalid review ID format'),
  validate
];

/* ==================== AVAILABILITY VALIDATORS ==================== */

export const createAvailabilityValidator = [
  body('dayOfWeek')
    .notEmpty().withMessage('Day of week is required')
    .isInt({ min: 0, max: 6 }).withMessage('Day must be 0-6 (Sunday-Saturday)'),
  
  body('slots')
    .notEmpty().withMessage('At least one time slot is required')
    .isArray({ min: 1 }).withMessage('Slots must be an array with at least one item'),
  
  body('slots.*.startTime')
    .notEmpty().withMessage('Start time is required for each slot')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be in HH:MM format'),
  
  body('slots.*.endTime')
    .notEmpty().withMessage('End time is required for each slot')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be in HH:MM format'),
  
  validate
];

export const availabilityIdParam = [
  param('id')
    .notEmpty().withMessage('Availability ID is required')
    .isMongoId().withMessage('Invalid availability ID format'),
  validate
];

/* ==================== COMMON VALIDATORS ==================== */

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .trim(),
  
  query('fields')
    .optional()
    .trim(),
  
  validate
];

export const mongoIdParam = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];
