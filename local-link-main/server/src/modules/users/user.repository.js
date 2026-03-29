import User from './user.model.js';

/**
 * User Repository
 * Handles all database operations for User model
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<User>}
 */
export const createUser = async (userData) => {
  return await User.create(userData);
};

/**
 * Find user by ID
 * @param {string} id - User ID
 * @param {Object} options - Query options
 * @returns {Promise<User|null>}
 */
export const findById = async (id, options = {}) => {
  const { select = '', populate = [] } = options;
  let query = User.findById(id);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);

  return await query;
};

/**
 * Find user by email
 * @param {string} email - User email
 * @param {boolean} includePassword - Include password field
 * @returns {Promise<User|null>}
 */
export const findByEmail = async (email, includePassword = false) => {
  let query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) query = query.select('+password');
  return await query;
};

/**
 * Find user by ID with password
 * @param {string} id - User ID
 * @returns {Promise<User|null>}
 */
export const findByIdWithPassword = async (id) => {
  return await User.findById(id).select('+password');
};

/**
 * Find all users with filtering, pagination, and sorting
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

  let query = User.find(filter);

  if (select) query = query.select(select);
  if (populate.length) query = query.populate(populate);
  if (sort) query = query.sort(sort);

  const [users, total] = await Promise.all([
    query.skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    data: users,
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
 * Update user by ID
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<User|null>}
 */
export const updateById = async (id, updateData, options = {}) => {
  const { newDoc = true, select = '' } = options;
  
  let query = User.findByIdAndUpdate(id, updateData, { new: newDoc });
  if (select) query = query.select(select);

  return await query;
};

/**
 * Delete user by ID
 * @param {string} id - User ID
 * @returns {Promise<User|null>}
 */
export const deleteById = async (id) => {
  return await User.findByIdAndDelete(id);
};

/**
 * Check if user exists
 * @param {Object} filter - Filter criteria
 * @returns {Promise<boolean>}
 */
export const exists = async (filter) => {
  const count = await User.countDocuments(filter);
  return count > 0;
};

/**
 * Find users by location (geospatial query)
 * @param {Array} coordinates - [longitude, latitude]
 * @param {number} maxDistance - Max distance in meters
 * @returns {Promise<Array>}
 */
export const findNearLocation = async (coordinates, maxDistance = 5000) => {
  return await User.find({
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
 * Find providers by category/specialty
 * @param {string} specialty - Specialty to search
 * @returns {Promise<Array>}
 */
export const findProvidersBySpecialty = async (specialty) => {
  return await User.find({
    role: 'provider',
    'providerInfo.specialties': specialty
  });
};

/**
 * Update user verification status
 * @param {string} id - User ID
 * @param {boolean} isVerified - Verification status
 * @returns {Promise<User|null>}
 */
export const updateVerificationStatus = async (id, isVerified) => {
  return await User.findByIdAndUpdate(
    id,
    { isVerified },
    { new: true }
  );
};

/**
 * Get user statistics
 * @param {string} role - User role to filter
 * @returns {Promise<Object>}
 */
export const getStats = async (role = null) => {
  const filter = role ? { role } : {};
  
  const stats = await User.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        verifiedCount: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ]);

  return stats;
};
