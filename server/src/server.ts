import { Server } from 'http';
import { app } from './app';
import environment from './config/environment';
import connectDB from './config/db';

export async function startServer(): Promise<Server> {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(environment.server.port, () => {
      console.log(`Server running on port ${environment.server.port} (${environment.getEnvironmentName()})`);
      
      if (environment.isDevelopment()) {
        console.log('Configuration:', {
          environment: environment.getEnvironmentName(),
          port: environment.server.port,
          mongoDb: 'Connected',
          auth0Domain: environment.auth0.domain,
          corsOrigin: environment.security.corsOrigin,
        });
      }
    });

    // Graceful shutdown handling
    const gracefulShutdown = () => {
      console.log('Received shutdown signal. Starting graceful shutdown...');
      server.close(async () => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

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
  startServer();
}