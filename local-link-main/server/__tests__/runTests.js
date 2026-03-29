/**
 * Manual Integration Test Script
 * Run this to verify all modules are working correctly
 * 
 * Usage: node __tests__/runTests.js
 */

import mongoose from 'mongoose';
import { generateAccessToken, generateRefreshToken } from '../src/modules/auth/auth.utils.js';

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

const test = (name, fn) => {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, passed: true });
    log.success(name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    log.error(`${name}: ${error.message}`);
  }
};

const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) throw new Error(msg || `Expected ${expected}, got ${actual}`);
  },
  truthy: (value, msg) => {
    if (!value) throw new Error(msg || 'Expected truthy value');
  },
  defined: (value, msg) => {
    if (value === undefined) throw new Error(msg || 'Expected defined value');
  }
};

// ==================== TESTS ====================

log.section('🧪 Running Module Tests');

// Test 1: Auth Utils
log.section('🔐 Auth Utils');

test('generateAccessToken should return a valid JWT', () => {
  const user = { id: '123', email: 'test@test.com', role: 'customer' };
  const token = generateAccessToken(user);
  assert.truthy(token, 'Token should be generated');
  assert.equal(typeof token, 'string', 'Token should be a string');
});

test('generateRefreshToken should return a valid JWT', () => {
  const user = { id: '123' };
  const token = generateRefreshToken(user);
  assert.truthy(token, 'Refresh token should be generated');
});

// Test 2: Model Imports
log.section('📊 Model Imports');

test('User model should import successfully', async () => {
  const User = (await import('../src/modules/users/user.model.js')).default;
  assert.defined(User, 'User model should be defined');
});

test('Service model should import successfully', async () => {
  const Service = (await import('../src/modules/services/service.model.js')).default;
  assert.defined(Service, 'Service model should be defined');
});

test('Booking model should import successfully', async () => {
  const Booking = (await import('../src/modules/bookings/booking.model.js')).default;
  assert.defined(Booking, 'Booking model should be defined');
});

test('Review model should import successfully', async () => {
  const Review = (await import('../src/modules/reviews/review.model.js')).default;
  assert.defined(Review, 'Review model should be defined');
});

test('Availability model should import successfully', async () => {
  const Availability = (await import('../src/modules/availability/availability.model.js')).default;
  assert.defined(Availability, 'Availability model should be defined');
});

// Test 3: Middleware Imports
log.section('🛡️ Middleware Imports');

test('Auth middleware should import successfully', async () => {
  const { protect } = await import('../src/shared/middleware/auth.middleware.js');
  assert.defined(protect, 'protect middleware should be defined');
});

test('Role middleware should import successfully', async () => {
  const { restrictTo } = await import('../src/shared/middleware/role.middleware.js');
  assert.defined(restrictTo, 'restrictTo middleware should be defined');
});

test('Error middleware should import successfully', async () => {
  const errorModule = await import('../src/shared/middleware/error.middleware.js');
  assert.defined(errorModule.default, 'errorHandler should be defined as default');
  assert.defined(errorModule.ApiError, 'ApiError class should be defined');
});

// Test 4: Utility Imports
log.section('🔧 Utility Imports');

test('APIFeatures should import successfully', async () => {
  const APIFeatures = (await import('../src/shared/utils/apiFeatures.js')).default;
  assert.defined(APIFeatures, 'APIFeatures should be defined');
  
  // Test instantiation
  const features = new APIFeatures({}, {});
  assert.defined(features.filter, 'filter method should exist');
  assert.defined(features.sort, 'sort method should exist');
  assert.defined(features.paginate, 'paginate method should exist');
});

test('Validators should import successfully', async () => {
  const { registerValidator, loginValidator } = await import('../src/shared/utils/validators.js');
  assert.defined(registerValidator, 'registerValidator should be defined');
  assert.defined(loginValidator, 'loginValidator should be defined');
});

// Test 5: Service Imports
log.section('⚙️ Service Imports');

test('Auth service should import successfully', async () => {
  const authService = await import('../src/modules/auth/auth.service.js');
  assert.defined(authService.register, 'register function should be defined');
  assert.defined(authService.login, 'login function should be defined');
  assert.defined(authService.refreshAccessToken, 'refreshAccessToken should be defined');
});

test('User service should import successfully', async () => {
  const userService = await import('../src/modules/users/user.service.js');
  assert.defined(userService.register, 'register function should be defined');
  assert.defined(userService.login, 'login function should be defined');
  assert.defined(userService.getProfile, 'getProfile function should be defined');
});

test('Service service should import successfully', async () => {
  const serviceService = await import('../src/modules/services/service.service.js');
  assert.defined(serviceService.createService, 'createService function should be defined');
  assert.defined(serviceService.getAllServices, 'getAllServices function should be defined');
});

test('Booking service should import successfully', async () => {
  const bookingService = await import('../src/modules/bookings/booking.service.js');
  assert.defined(bookingService.createBooking, 'createBooking function should be defined');
  assert.defined(bookingService.acceptBooking, 'acceptBooking function should be defined');
  assert.defined(bookingService.cancelBooking, 'cancelBooking function should be defined');
});

test('Review service should import successfully', async () => {
  const reviewService = await import('../src/modules/reviews/review.service.js');
  assert.defined(reviewService.createReview, 'createReview function should be defined');
  assert.defined(reviewService.updateReview, 'updateReview function should be defined');
});

test('Availability service should import successfully', async () => {
  const availabilityService = await import('../src/modules/availability/availability.service.js');
  assert.defined(availabilityService.createAvailability, 'createAvailability function should be defined');
  assert.defined(availabilityService.getProviderAvailability, 'getProviderAvailability function should be defined');
});

// Test 6: Controller Imports
log.section('🎮 Controller Imports');

test('Auth controller should import successfully', async () => {
  const authController = await import('../src/modules/auth/auth.controller.js');
  assert.defined(authController.login, 'login function should be defined');
  assert.defined(authController.register, 'register function should be defined');
});

test('User controller should import successfully', async () => {
  const userController = await import('../src/modules/users/user.controller.js');
  assert.defined(userController.getProfile, 'getProfile function should be defined');
  assert.defined(userController.updateProfile, 'updateProfile function should be defined');
});

test('Service controller should import successfully', async () => {
  const serviceController = await import('../src/modules/services/service.controller.js');
  assert.defined(serviceController.createService, 'createService function should be defined');
  assert.defined(serviceController.getAllServices, 'getAllServices function should be defined');
});

test('Booking controller should import successfully', async () => {
  const bookingController = await import('../src/modules/bookings/booking.controller.js');
  assert.defined(bookingController.createBooking, 'createBooking function should be defined');
  assert.defined(bookingController.acceptBooking, 'acceptBooking function should be defined');
});

// Test 7: Route Imports
log.section('🛣️ Route Imports');

test('Auth routes should import successfully', async () => {
  const authRoutes = (await import('../src/modules/auth/auth.routes.js')).default;
  assert.defined(authRoutes, 'authRoutes should be defined');
});

test('User routes should import successfully', async () => {
  const userRoutes = (await import('../src/modules/users/user.routes.js')).default;
  assert.defined(userRoutes, 'userRoutes should be defined');
});

test('Service routes should import successfully', async () => {
  const serviceRoutes = (await import('../src/modules/services/service.routes.js')).default;
  assert.defined(serviceRoutes, 'serviceRoutes should be defined');
});

test('Booking routes should import successfully', async () => {
  const bookingRoutes = (await import('../src/modules/bookings/booking.routes.js')).default;
  assert.defined(bookingRoutes, 'bookingRoutes should be defined');
});

test('Review routes should import successfully', async () => {
  const reviewRoutes = (await import('../src/modules/reviews/review.routes.js')).default;
  assert.defined(reviewRoutes, 'reviewRoutes should be defined');
});

test('Availability routes should import successfully', async () => {
  const availabilityRoutes = (await import('../src/modules/availability/availability.routes.js')).default;
  assert.defined(availabilityRoutes, 'availabilityRoutes should be defined');
});

test('Admin routes should import successfully', async () => {
  const adminRoutes = (await import('../src/modules/admin/admin.routes.js')).default;
  assert.defined(adminRoutes, 'adminRoutes should be defined');
});

// Test 8: App and Server
log.section('🚀 App & Server');

test('App should import successfully', async () => {
  const app = (await import('../src/app.js')).default;
  assert.defined(app, 'app should be defined');
});

test('Server should import successfully', async () => {
  const server = (await import('../src/server.js')).default;
  assert.defined(server, 'startServer function should be defined');
});

// Test 9: Environment Config
log.section('⚙️ Environment Config');

test('Env config should load', async () => {
  const envVars = (await import('../src/config/env.js')).default;
  assert.defined(envVars.PORT, 'PORT should be defined');
  assert.defined(envVars.JWT_SECRET, 'JWT_SECRET should be defined');
});

// ==================== RESULTS ====================

setTimeout(() => {
  log.section('📊 Test Results');
  console.log(`\n${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.blue}Total:  ${results.passed + results.failed}${colors.reset}\n`);

  if (results.failed > 0) {
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  if (results.failed === 0) {
    log.success('🎉 All tests passed!');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}, 1000);
