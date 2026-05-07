import Service from './service.model.js';

/**
 * Service Repository
 * Handles all database operations for Service model
 */

/**
 * Create a new service
 * @param {Object} serviceData - Service data
 * @returns {Promise<Service>}
 */
export const createService = async (serviceData) => {
  return await Service.create(serviceData);
};

/**
 * Find service by ID
 * @param {string} id - Service ID
 * @param {Object} options - Query options
 * @returns {Promise<Service|null>}
 */
export const findById = async (id, options = {}) => {
  const { select = '', populate = [] } = options;
  let query = Service.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);

  return await query;
};

/**
 * Find all services with filtering, pagination, and sorting
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findAll = async (filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    select = '',
    populate = []
  } = options;

  const skip = (page - 1) * limit;

  let query = Service.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (sort) query = query.sort(sort);

  const [services, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Service.countDocuments(filter)
  ]);

  return {
    data: services,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Update service by ID
 * @param {string} id - Service ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<Service|null>}
 */
export const updateById = async (id, updateData, options = {}) => {
  const { newDoc = true, select = '' } = options;
  
  let query = Service.findByIdAndUpdate(id, updateData, { new: newDoc });
  if (select) query = query.select(select);

  return await query;
};

/**
 * Delete service by ID
 * @param {string} id - Service ID
 * @returns {Promise<Service|null>}
 */
export const deleteById = async (id) => {
  return await Service.findByIdAndDelete(id);
};

/**
 * Find services by provider
 * @param {string} providerId - Provider ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByProvider = async (providerId, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    Service.find({ provider: providerId }).sort(sort).skip(skip).limit(limit),
    Service.countDocuments({ provider: providerId })
  ]);

  return {
    data: services,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Find services by category
 * @param {string} category - Category name
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const findByCategory = async (category, options = {}) => {
  const { page = 1, limit = 10, sort = '-averageRating' } = options;
  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    Service.find({ category, isActive: true }).sort(sort).skip(skip).limit(limit),
    Service.countDocuments({ category, isActive: true })
  ]);

  return {
    data: services,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Find services near location (geospatial query)
 * @param {Array} coordinates - [longitude, latitude]
 * @param {number} maxDistance - Max distance in meters
 * @param {Object} filter - Additional filter criteria
 * @returns {Promise<Array>}
 */
export const findNearLocation = async (coordinates, maxDistance = 5000, filter = {}) => {
  return await Service.find({
    ...filter,
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

/**
 * Search services by text
 * @param {string} searchTerm - Search term
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const search = async (searchTerm, options = {}) => {
  return await Service.search(searchTerm, options);
};

/**
 * Get service statistics
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>}
 */
export const getStats = async (serviceId) => {
  const service = await Service.findById(serviceId);
  
  if (!service) return null;

  return {
    averageRating: service.averageRating,
    totalReviews: service.totalReviews,
    totalRatings: service.totalRatings
  };
};

/**
 * Get all categories with counts
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  return await Service.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$averageRating' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Check if service exists
 * @param {Object} filter - Filter criteria
 * @returns {Promise<boolean>}
 */
export const exists = async (filter) => {
  const count = await Service.countDocuments(filter);
  return count > 0;
};

/**
 * Toggle service active status
 * @param {string} id - Service ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Service|null>}
 */
export const toggleActive = async (id, isActive) => {
  return await Service.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );
};
