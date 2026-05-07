import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import * as serviceService from './service.service.js';
import Service from './service.model.js';
import APIFeatures from '../../shared/utils/apiFeatures.js';
import { paginationValidator } from '../../shared/utils/validators.js';
import logger from '../../shared/utils/logger.js';

/**
 * Service Controller
 * Handles HTTP requests for service operations
 */

/**
 * Create a new service
 * POST /api/services
 */
export const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.body, req.user.id);

  logger.info(`Service created: ${service._id}`);

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: service
  });
});

/**
 * Get all services
 * GET /api/services
 */
export const getAllServices = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Service.find(), req.query)
    .filter()
    .advancedFilter()
    .sort()
    .paginate()
    .populate([{ path: 'provider', select: 'name profileImage averageRating' }]);

  const result = await features.getPaginatedResponse();
  
  res.status(200).json(result);
});

/**
 * Get service by ID
 * GET /api/services/:id
 */
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);

  res.status(200).json({
    success: true,
    data: service
  });
});

/**
 * Update service
 * PATCH /api/services/:id
 */
export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    data: service
  });
});

/**
 * Delete service
 * DELETE /api/services/:id
 */
export const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully'
  });
});

/**
 * Get services by provider
 * GET /api/services/provider/:providerId
 */
export const getServicesByProvider = asyncHandler(async (req, res) => {
  const services = await serviceService.getServicesByProvider(
    req.params.providerId,
    req.query
  );

  res.status(200).json({
    success: true,
    ...services
  });
});

/**
 * Get services by category
 * GET /api/services/category/:category
 */
export const getServicesByCategory = asyncHandler(async (req, res) => {
  const services = await serviceService.getServicesByCategory(
    req.params.category,
    req.query
  );

  res.status(200).json({
    success: true,
    ...services
  });
});

/**
 * Find services near location
 * GET /api/services/near
 */
export const findServicesNearLocation = asyncHandler(async (req, res) => {
  const { lng, lat, ...queryParams } = req.query;

  if (!lng || !lat) {
    return res.status(400).json({
      success: false,
      message: 'Longitude and latitude are required',
      errorCode: 'MISSING_PARAMETERS'
    });
  }

  const services = await serviceService.findServicesNearLocation(
    [parseFloat(lng), parseFloat(lat)],
    queryParams
  );

  res.status(200).json(services);
});

/**
 * Search services
 * GET /api/services/search
 */
export const searchServices = asyncHandler(async (req, res) => {
  const { q, ...queryParams } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
      errorCode: 'MISSING_QUERY'
    });
  }

  const services = await serviceService.searchServices(q, queryParams);

  res.status(200).json({
    success: true,
    ...services
  });
});

/**
 * Get service statistics
 * GET /api/services/:id/stats
 */
export const getServiceStats = asyncHandler(async (req, res) => {
  const stats = await serviceService.getServiceStats(req.params.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Get all categories
 * GET /api/services/categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await serviceService.getCategories();

  res.status(200).json({
    success: true,
    ...categories
  });
});

/**
 * Toggle service active status
 * PATCH /api/services/:id/toggle-active
 */
export const toggleServiceActive = asyncHandler(async (req, res) => {
  const service = await serviceService.toggleServiceActive(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
    data: service
  });
});

/**
 * Get my services (authenticated user's services)
 * GET /api/services/my-services
 */
export const getMyServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getServicesByProvider(
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...services
  });
});
