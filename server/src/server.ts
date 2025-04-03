import { Server } from 'http';
import { app } from './app';
import environment from './config/environment';
import connectDB from './config/db';
import mongoose from 'mongoose';

interface ServerConfig {
  port: number;
  host?: string;
}

/**
 * Start the server with the given configuration
 * @param config Server configuration
 * @returns HTTP Server instance
 */
export async function startServer(config: ServerConfig = { port: parseInt(environment.PORT, 10) }): Promise<Server> {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} (${environment.getEnvironmentName()})`);
      
      if (environment.isDevelopment()) {
        console.log('Configuration:', {
          environment: environment.getEnvironmentName(),
          port: config.port,
          host: config.host || 'default',
          mongoDb: 'Connected',
          auth0Domain: environment.auth0.domain,
          corsOrigin: environment.security.corsOrigin,
        });
      }
    });

    // Error handling
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string'
        ? 'Pipe ' + config.port
        : 'Port ' + config.port;

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\nReceived shutdown signal. Starting graceful shutdown...');
      
      // Close server first
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('HTTP server closed.');
          resolve();
        });
      });

      // Then disconnect from database
      await mongoose.disconnect();
      console.log('Database connections closed.');

      // Exit process
      process.exit(0);
    };

    // Handle termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}