import { startServer } from './server';
import environment from './config/environment';

// Start server with environment-specific configuration
startServer({
  port: environment.server.port,
  host: environment.isDevelopment() ? 'localhost' : undefined
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});