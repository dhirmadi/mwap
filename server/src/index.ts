import 'dotenv/config';
import { app } from './app';
import { connectDB } from '@core/config/database';
import { env } from '@core/config/environment';
import { logger } from '@core/utils/logger';

// Connect to database
connectDB();

// Start server
const server = app.listen(env.server.port, () => {
  logger.info('Server started', {
    port: env.server.port,
    environment: env.getEnvironmentName()
  });
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
