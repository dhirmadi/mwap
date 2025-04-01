const environment = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGO_URI,
    encryptionKey: process.env.MONGO_CLIENT_ENCRYPTION_KEY,
    keyName: process.env.MONGO_ENCRYPTION_KEY_NAME || 'mwap_data_key',
  },

  // Auth0 Configuration
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
  },

  // Security Configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Monitoring Configuration
  monitoring: {
    statusCheckInterval: parseInt(process.env.STATUS_CHECK_INTERVAL, 10) || 30000,
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  },

  // Validation
  validate() {
    const required = [
      'mongodb.uri',
      'mongodb.encryptionKey',
      'auth0.domain',
      'auth0.clientId',
      'auth0.clientSecret',
      'auth0.audience',
    ];

    const missing = required.filter(key => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], this);
      return !value;
    });

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  },

  // Helper method to get environment name
  getEnvironmentName() {
    if (process.env.HEROKU_APP_NAME?.includes('production')) return 'production';
    if (process.env.HEROKU_APP_NAME?.includes('staging')) return 'staging';
    if (process.env.HEROKU_APP_NAME) return 'review';
    return this.nodeEnv;
  },

  // Helper method to check if running in production
  isProduction() {
    return this.nodeEnv === 'production';
  },

  // Helper method to check if running in development
  isDevelopment() {
    return this.nodeEnv === 'development';
  },
};

// Validate environment variables
environment.validate();

module.exports = environment;