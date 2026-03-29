import mongoose from 'mongoose';

/**
 * Test Database Utilities
 */

// Store original connection state
let originalConnection = null;

/**
 * Connect to test database
 * Uses in-memory MongoDB or test database
 */
export const connectTestDB = async () => {
  try {
    // Use test database
    const testUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/local-link-test';
    
    await mongoose.connect(testUri, {
      dbName: 'local-link-test'
    });
    
    console.log('✅ Test database connected');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Test database connection failed:', error.message);
    throw error;
  }
};

/**
 * Clear all collections between tests
 */
export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Close test database connection
 */
export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log('✅ Test database closed');
};

/**
 * Create test user helper
 */
export const createTestUser = async (overrides = {}) => {
  const User = (await import('./src/modules/users/user.model.js')).default;
  
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'hashedPassword123',
    role: 'customer',
    isVerified: true,
    ...overrides
  };
  
  const user = await User.create(userData);
  return user;
};

/**
 * Create test service helper
 */
export const createTestService = async (providerId, overrides = {}) => {
  const Service = (await import('./src/modules/services/service.model.js')).default;
  
  const serviceData = {
    title: 'Test Service',
    description: 'Test service description',
    category: 'plumbing',
    price: 100,
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610]
    },
    provider: providerId,
    ...overrides
  };
  
  const service = await Service.create(serviceData);
  return service;
};

/**
 * Create test booking helper
 */
export const createTestBooking = async (customerId, providerId, serviceId, overrides = {}) => {
  const Booking = (await import('./src/modules/bookings/booking.model.js')).default;
  
  const bookingData = {
    customer: customerId,
    provider: providerId,
    service: serviceId,
    bookingDate: new Date(Date.now() + 86400000), // Tomorrow
    duration: 60,
    status: 'pending',
    ...overrides
  };
  
  const booking = await Booking.create(bookingData);
  return booking;
};

/**
 * Generate test tokens
 */
export const generateTestToken = async (user) => {
  const { generateAccessToken } = await import('./src/modules/auth/auth.utils.js');
  return generateAccessToken(user);
};

/**
 * Create authenticated headers
 */
export const getAuthHeaders = async (user) => {
  const token = await generateTestToken(user);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
