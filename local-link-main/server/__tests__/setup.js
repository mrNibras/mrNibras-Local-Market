import mongoose from 'mongoose';
import { clearDB } from './utils/testUtils.js';

/**
 * Global setup before all tests
 */
export const setup = async () => {
  console.log('🚀 Setting up test environment...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.JWT_ISSUER = 'local-link-test';
  process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
  
  // Connect to test database
  try {
    const testUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/local-link-test';
    await mongoose.connect(testUri, {
      dbName: 'local-link-test'
    });
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Setup before each test
 */
export const beforeEachTest = async () => {
  await clearDB();
};

/**
 * Teardown after all tests
 */
export const teardown = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Drop test database
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  console.log('✅ Test database closed');
};
