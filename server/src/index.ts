import { startServer } from './server';
import environment from './config/environment';

// Start server with environment-specific configuration
startServer({
  port: Number(environment.server?.port) || 3000,
  host: environment.isDevelopment() ? 'localhost' : undefined
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});