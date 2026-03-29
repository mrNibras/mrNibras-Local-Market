/**
 * API Features Utility Class
 * Handles filtering, sorting, pagination, and geospatial queries
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filter by exact match fields
   * @param {Object} filterObj - Object with filter criteria
   */
  filter(filterObj = {}) {
    const queryObj = { ...filterObj };
    
    // Remove fields that shouldn't be filtered
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'search', 'near'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Add filters from query string
    const queryStringObj = {};
    for (const [key, value] of Object.entries(this.queryString)) {
      if (!excludedFields.includes(key) && value !== undefined) {
        queryStringObj[key] = value;
      }
    }

    // Merge filters
    this.query = this.query.find({ ...queryObj, ...queryStringObj });
    return this;
  }

  /**
   * Advanced filtering with operators (gt, gte, lt, lte, in, ne)
   * Converts query params like ?price[gte]=100 to MongoDB operators
   */
  advancedFilter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'search', 'near'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Convert operators
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in|ne|regex|exists)\b/g, match => `$${match}`);
    queryString = queryString.replace(/true|false/g, match => match === 'true' ? true : false);

    const filters = JSON.parse(queryString);
    this.query = this.query.find(filters);
    return this;
  }

  /**
   * Sort results
   * Supports multiple fields: ?sort=price,-createdAt
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Field limiting (projection)
   * Supports: ?fields=name,price,category
   */
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  /**
   * Pagination
   * Supports: ?page=2&limit=10
   */
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Search functionality
   * Searches across specified fields
   * @param {string[]} fields - Fields to search in
   */
  search(fields = []) {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchCriteria = fields.map(field => ({ [field]: searchRegex }));
      this.query = this.query.or(searchCriteria);
    }
    return this;
  }

  /**
   * Geospatial query - Find near location
   * Supports: ?near=lng,lat&maxDistance=5000
   */
  geoSearch(locationField = 'location') {
    if (this.queryString.near) {
      const [lng, lat] = this.queryString.near.split(',').map(Number);
      const maxDistance = this.queryString.maxDistance || 5000; // Default 5km

      this.query = this.query.find({
        [locationField]: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        }
      });
    }
    return this;
  }

  /**
   * Geospatial query - Find within a polygon
   * @param {Array} coordinates - Array of [lng, lat] pairs forming a polygon
   */
  geoWithin(locationField = 'location', coordinates) {
    this.query = this.query.find({
      [locationField]: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }
      }
    });
    return this;
  }

  /**
   * Populate referenced documents
   * @param {string|string[]} paths - Paths to populate
   */
  populate(paths) {
    const populatePaths = Array.isArray(paths) ? paths : [paths];
    populatePaths.forEach(path => {
      this.query = this.query.populate(path);
    });
    return this;
  }

  /**
   * Get paginated response
   * @param {Object} options - Additional response options
   */
  async getPaginatedResponse(options = {}) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;

    // Get total count
    const total = await this.query.model.countDocuments(this.query.getFilter());
    
    // Execute query
    const results = await this.query;

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return {
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        nextPage,
        prevPage,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      ...options
    };
  }
}

export default APIFeatures;
