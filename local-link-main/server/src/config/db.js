import mongoose from 'mongoose';
import envVars from './env.js';
import logger from '../shared/utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envVars.MONGODB_URI, {
      // Mongoose 6+ options
      dbName: 'local-link'
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for geospatial queries
    await createIndexes();

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    const User = mongoose.model('User');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ location: '2dsphere' });
    logger.info('✅ User indexes created');

    // Service indexes
    const Service = mongoose.model('Service');
    await Service.collection.createIndex({ provider: 1 });
    await Service.collection.createIndex({ category: 1 });
    await Service.collection.createIndex({ location: '2dsphere' });
    logger.info('✅ Service indexes created');

    // Booking indexes
    const Booking = mongoose.model('Booking');
    await Booking.collection.createIndex({ customer: 1 });
    await Booking.collection.createIndex({ provider: 1 });
    await Booking.collection.createIndex({ bookingDate: 1 });
    await Booking.collection.createIndex({ status: 1 });
    logger.info('✅ Booking indexes created');

    // Review indexes
    const Review = mongoose.model('Review');
    await Review.collection.createIndex({ service: 1 });
    await Review.collection.createIndex({ user: 1 });
    logger.info('✅ Review indexes created');

    // Availability indexes
    const Availability = mongoose.model('Availability');
    await Availability.collection.createIndex({ provider: 1 });
    logger.info('✅ Availability indexes created');

  } catch (error) {
    logger.warn(`⚠️ Index creation warning: ${error.message}`);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`❌ MongoDB error: ${err.message}`);
});

export default connectDB;
