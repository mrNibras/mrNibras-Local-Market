import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import envVars from './config/env.js';
import { stream } from './shared/utils/logger.js';
import errorHandler from './shared/middleware/error.middleware.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import availabilityRoutes from './modules/availability/availability.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import offerRoutes from './modules/offers/offer.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import favoriteRoutes from './modules/favorites/favorite.routes.js';
import disputeRoutes from './modules/disputes/dispute.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const app = express();

// ==================== Security Middleware ====================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    envVars.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: envVars.RATE_LIMIT_WINDOW_MS,
  max: envVars.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api', limiter);

// ==================== Body Parsing Middleware ====================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Data Sanitization ====================

// Sanitize against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// ==================== Compression ====================

app.use(compression());

// ==================== Logging ====================

if (envVars.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream }));
} else {
  app.use(morgan('combined', { stream }));
}

// ==================== API Routes ====================

const apiPrefix = envVars.API_PREFIX;

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: envVars.NODE_ENV
  });
});

// API routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/services`, serviceRoutes);
app.use(`${apiPrefix}/bookings`, bookingRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/availability`, availabilityRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/offers`, offerRoutes);
app.use(`${apiPrefix}/chat`, chatRoutes);
app.use(`${apiPrefix}/favorites`, favoriteRoutes);
app.use(`${apiPrefix}/disputes`, disputeRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// API documentation route
app.get(`${apiPrefix}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Local Link API',
    version: '1.0.0',
    endpoints: {
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      services: `${apiPrefix}/services`,
      bookings: `${apiPrefix}/bookings`,
      reviews: `${apiPrefix}/reviews`,
      availability: `${apiPrefix}/availability`,
      payments: `${apiPrefix}/payments`,
      notifications: `${apiPrefix}/notifications`,
      offers: `${apiPrefix}/offers`,
      chat: `${apiPrefix}/chat`,
      favorites: `${apiPrefix}/favorites`,
      disputes: `${apiPrefix}/disputes`,
      analytics: `${apiPrefix}/analytics`,
      admin: `${apiPrefix}/admin`
    }
  });
});

// ==================== 404 Handler ====================

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'NOT_FOUND'
  });
});

// ==================== Error Handler ====================

app.use(errorHandler);

export default app;
