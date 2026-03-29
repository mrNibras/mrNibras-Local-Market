import app from './app.js';
import envVars from './config/env.js';
import connectDB from './config/db.js';
import logger from './shared/utils/logger.js';

// ==================== Start Server ====================

const PORT = envVars.PORT;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Local Link API Server                                ║
║                                                           ║
║   Environment: ${envVars.NODE_ENV.padEnd(36)}║
║   Port: ${String(PORT).padEnd(45)}║
║   API Prefix: ${envVars.API_PREFIX.padEnd(38)}║
║                                                           ║
║   Ready to accept requests!                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('💤 Process terminated');
      });
    });

    process.on('SIGINT', () => {
      logger.info('👋 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('💤 Process terminated');
      });
    });

  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

export default startServer;
