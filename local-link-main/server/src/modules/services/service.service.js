import * as serviceRepository from './service.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/middleware/error.middleware.js';
import logger from '../../shared/utils/logger.js';

/**
 * Service Service
 * Contains business logic for service operations
 */

/**
 * Create a new service
 * @param {Object} serviceData - Service data
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export const createService = async (serviceData, providerId) => {
  const service = await serviceRepository.createService({
    ...serviceData,
    provider: providerId
  });

  logger.info(`Service created: ${service.title} by provider ${providerId}`);

  return service;
};

/**
 * Get service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const getServiceById = async (serviceId) => {
  const service = await serviceRepository.findById(serviceId, {
    populate: [{ path: 'provider', select: 'name email phone profileImage' }]
  });

  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  return service;
};

/**
 * Update service
 * @param {string} serviceId - Service ID
 * @param {Object} updateData - Data to update
 * @param {string} requesterId - ID of the user making the request
 * @returns {Promise<Object>}
 */
export const updateService = async (serviceId, updateData, requesterId) => {
  const service = await serviceRepository.findById(serviceId);

  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  // Check if user is the owner or admin
  if (service.provider.toString() !== requesterId) {
    throw new ForbiddenError('You can only update your own services', 'NOT_AUTHORIZED');
  }

  const updatedService = await serviceRepository.updateById(serviceId, updateData);

  logger.info(`Service updated: ${serviceId}`);

  return updatedService;
};

/**
 * Delete service
 * @param {string} serviceId - Service ID
 * @param {string} requesterId - ID of the user making the request
 * @returns {Promise<Object>}
 */
export const deleteService = async (serviceId, requesterId) => {
  const service = await serviceRepository.findById(serviceId);

  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  // Check if user is the owner or admin
  if (service.provider.toString() !== requesterId) {
    throw new ForbiddenError('You can only delete your own services', 'NOT_AUTHORIZED');
  }

  await serviceRepository.deleteById(serviceId);

  logger.info(`Service deleted: ${serviceId}`);

  return { message: 'Service deleted successfully' };
};

/**
 * Get all services with filtering and pagination
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getAllServices = async (queryParams) => {
  const { page, limit, sort, ...filter } = queryParams;
  
  // Set default filter for active services if not specified
  if (filter.isActive === undefined) filter.isActive = true;

  const result = await serviceRepository.findAll(filter, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-averageRating',
    populate: [{ path: 'provider', select: 'name email profileImage averageRating' }]
  });

  return result;
};

/**
 * Get services by provider
 * @param {string} providerId - Provider ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getServicesByProvider = async (providerId, queryParams) => {
  const { page, limit, sort } = queryParams;

  const result = await serviceRepository.findByProvider(providerId, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-createdAt'
  });

  return result;
};

/**
 * Get services by category
 * @param {string} category - Category name
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getServicesByCategory = async (category, queryParams) => {
  const { page, limit, sort } = queryParams;

  const result = await serviceRepository.findByCategory(category, {
    page: page || 1,
    limit: limit || 10,
    sort: sort || '-averageRating'
  });

  return result;
};

/**
 * Find services near location
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const findServicesNearLocation = async (coordinates, queryParams) => {
  const { maxDistance = 5000, category, minPrice, maxPrice } = queryParams;

  const filter = {};
  if (category) filter.category = category;
  if (minPrice !== undefined) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
  if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

  const services = await serviceRepository.findNearLocation(coordinates, parseInt(maxDistance), filter);

  return {
    success: true,
    count: services.length,
    data: services
  };
};

/**
 * Search services
 * @param {string} searchTerm - Search term
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const searchServices = async (searchTerm, queryParams) => {
  const { page, limit, ...filters } = queryParams;

  const result = await serviceRepository.search(searchTerm, {
    page: page || 1,
    limit: limit || 10,
    ...filters
  });

  return result;
};

/**
 * Get service statistics
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const getServiceStats = async (serviceId) => {
  const stats = await serviceRepository.getStats(serviceId);

  if (!stats) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  return stats;
};

/**
 * Get all categories
 * @returns {Promise<Object>}
 */
export const getCategories = async () => {
  const categories = await serviceRepository.getCategories();

  return {
    count: categories.length,
    data: categories
  };
};

/**
 * Toggle service active status
 * @param {string} serviceId - Service ID
 * @param {string} requesterId - ID of the user making the request
 * @returns {Promise<Object>}
 */
export const toggleServiceActive = async (serviceId, requesterId) => {
  const service = await serviceRepository.findById(serviceId);

  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  // Check if user is the owner
  if (service.provider.toString() !== requesterId) {
    throw new ForbiddenError('You can only manage your own services', 'NOT_AUTHORIZED');
  }

  const updatedService = await serviceRepository.toggleActive(serviceId, !service.isActive);

  logger.info(`Service ${updatedService.isActive ? 'activated' : 'deactivated'}: ${serviceId}`);

  return updatedService;
};

/**
 * Update service rating (called after review is created/updated/deleted)
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const updateServiceRating = async (serviceId) => {
  const service = await serviceRepository.findById(serviceId);

  if (!service) {
    throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
  }

  await service.updateRating();

  return {
    averageRating: service.averageRating,
    totalReviews: service.totalReviews
  };
};
