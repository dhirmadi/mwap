import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mwap',
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || '',

  // Helper methods
  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },

  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },

  isTest(): boolean {
    return this.NODE_ENV === 'test';
  },

  getEnvironmentName(): string {
    return this.NODE_ENV;
  },

  // Server configuration
  server: {
    get port(): number {
      return parseInt(process.env.PORT || '3000', 10);
    }
  },

  // Auth0 configuration
  auth0: {
    get domain(): string {
      return process.env.AUTH0_DOMAIN || '';
    },
    get audience(): string {
      return process.env.AUTH0_AUDIENCE || '';
    }
  },

  // Security configuration
  security: {
    get corsOrigin(): string | boolean {
      return process.env.CORS_ORIGIN || true;
    }
  }
};

export default environment;