class Environment {
  constructor() {
    this.initializeConfig();
    this.validateConfig();
    Object.freeze(this); // Make configuration immutable
  }

  initializeConfig() {
    // Server Configuration
    this.server = {
      port: this.getEnvNumber('PORT', 54014),
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      host: process.env.HOST || '0.0.0.0',
      apiPrefix: '/api',
      compression: {
        enabled: true,
        level: 6
      }
    };

    // MongoDB Configuration
    this.mongodb = {
      uri: process.env.MONGO_URI,
      encryptionKey: process.env.MONGO_CLIENT_ENCRYPTION_KEY,
      keyName: process.env.MONGO_ENCRYPTION_KEY_NAME || 'mwap_data_key',
      options: {
        maxPoolSize: this.getEnvNumber('MONGO_MAX_POOL_SIZE', 10),
        minPoolSize: this.getEnvNumber('MONGO_MIN_POOL_SIZE', 2),
        connectTimeoutMS: this.getEnvNumber('MONGO_CONNECT_TIMEOUT_MS', 10000),
        socketTimeoutMS: this.getEnvNumber('MONGO_SOCKET_TIMEOUT_MS', 45000),
        family: 4
      }
    };

    // Auth0 Configuration
    this.auth0 = {
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
      tokenExpiryBuffer: this.getEnvNumber('AUTH0_TOKEN_EXPIRY_BUFFER', 60000)
    };

    // Security Configuration
    this.security = {
      corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:54014'],
      rateLimiting: {
        enabled: this.getEnvBoolean('RATE_LIMITING_ENABLED', true),
        windowMs: this.getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
        maxRequests: this.getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
        skipDevelopment: true
      },
      helmet: {
        enabled: true,
        hidePoweredBy: true,
        hsts: this.isProduction()
      },
      requestSizeLimit: '10kb'
    };

    // Monitoring Configuration
    this.monitoring = {
      statusCheckInterval: this.getEnvNumber('STATUS_CHECK_INTERVAL', 30000),
      enableRequestLogging: this.getEnvBoolean('ENABLE_REQUEST_LOGGING', true),
      logFormat: process.env.LOG_FORMAT || 'combined',
      metrics: {
        enabled: this.getEnvBoolean('METRICS_ENABLED', true),
        interval: this.getEnvNumber('METRICS_INTERVAL', 60000)
      }
    };

    // Cache Configuration
    this.cache = {
      enabled: this.getEnvBoolean('CACHE_ENABLED', true),
      ttl: this.getEnvNumber('CACHE_TTL', 300), // 5 minutes
      checkPeriod: this.getEnvNumber('CACHE_CHECK_PERIOD', 600) // 10 minutes
    };

    // Static Files Configuration
    this.static = {
      maxAge: this.isProduction() ? 31536000 : 0, // 1 year in production
      etag: true,
      lastModified: true
    };
  }

  // Environment Helpers
  getEnvNumber(key, defaultValue) {
    return parseInt(process.env[key], 10) || defaultValue;
  }

  getEnvBoolean(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  // Validation
  validateConfig() {
    // Temporarily disable validation for development
    if (this.isDevelopment()) {
      return;
    }

    const required = [
      'mongodb.uri',
      'mongodb.encryptionKey',
      'auth0.domain',
      'auth0.clientId',
      'auth0.clientSecret',
      'auth0.audience'
    ];

    const missing = required.filter(key => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], this);
      return !value;
    });

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate numeric ranges
    if (this.mongodb.options.maxPoolSize < this.mongodb.options.minPoolSize) {
      throw new Error('MongoDB maxPoolSize must be greater than minPoolSize');
    }

    if (this.security.rateLimiting.windowMs < 0 || this.security.rateLimiting.maxRequests < 0) {
      throw new Error('Rate limiting values must be positive');
    }
  }

  // Environment State
  getEnvironmentName() {
    if (process.env.HEROKU_APP_NAME?.includes('production')) return 'production';
    if (process.env.HEROKU_APP_NAME?.includes('staging')) return 'staging';
    if (process.env.HEROKU_APP_NAME) return 'review';
    return this.server.nodeEnv;
  }

  isProduction() {
    return this.server.nodeEnv === 'production';
  }

  isDevelopment() {
    return this.server.nodeEnv === 'development';
  }

  isTest() {
    return this.server.nodeEnv === 'test';
  }

  // Feature Flags
  isFeatureEnabled(featureName) {
    return this.getEnvBoolean(`FEATURE_${featureName.toUpperCase()}`, false);
  }
}

// Create and export a singleton instance
const environment = new Environment();
Object.freeze(environment);

module.exports = environment;