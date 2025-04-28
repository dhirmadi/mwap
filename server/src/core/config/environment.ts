interface ServerConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  host: string;
  apiPrefix: string;
  compression: {
    enabled: boolean;
    level: number;
  };
}

interface MongoDBConfig {
  uri: string | undefined;
  encryptionKey: string | undefined;
  keyName: string;
  options: {
    maxPoolSize: number;
    minPoolSize: number;
    connectTimeoutMS: number;
    socketTimeoutMS: number;
    family: number;
  };
}

interface Auth0Config {
  domain: string | undefined;
  clientId: string | undefined;
  clientSecret: string | undefined;
  audience: string | undefined;
  tokenExpiryBuffer: number;
}

interface SecurityConfig {
  corsOrigin: string;
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipDevelopment: boolean;
  };
  helmet: {
    enabled: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
  };
  requestSizeLimit: string;
}

interface MonitoringConfig {
  statusCheckInterval: number;
  enableRequestLogging: boolean;
  logFormat: string;
  metrics: {
    enabled: boolean;
    interval: number;
  };
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  checkPeriod: number;
}

interface StaticConfig {
  maxAge: number;
  etag: boolean;
  lastModified: boolean;
}

class Environment {
  server!: ServerConfig;
  mongodb!: MongoDBConfig;
  auth0!: Auth0Config;
  security!: SecurityConfig;
  monitoring!: MonitoringConfig;
  cache!: CacheConfig;
  static!: StaticConfig;

  constructor() {
    this.initializeConfig();
    this.validateConfig();
    Object.freeze(this); // Make configuration immutable
  }

  private initializeConfig(): void {
    // Server Configuration
    this.server = {
      port: this.getEnvNumber('PORT', process.env.NODE_ENV === 'development' ? 3001 : 3000),
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
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  // Validation
  private validateConfig(): void {
    // Temporarily disable validation for development
    if (this.server.nodeEnv === 'development') {
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
      const value = key.split('.').reduce((obj: any, k) => obj?.[k], this);
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
  getEnvironmentName(): string {
    const appName = process.env.HEROKU_APP_NAME;
    if (appName?.includes('production')) return 'production';
    if (appName?.includes('staging')) return 'staging';
    if (appName) return 'review';
    return this.server.nodeEnv;
  }

  isProduction(): boolean {
    return this.server.nodeEnv === 'production';
  }

  isDevelopment(): boolean {
    return this.server.nodeEnv === 'development';
  }

  isTest(): boolean {
    return this.server.nodeEnv === 'test';
  }

  // Feature Flags
  isFeatureEnabled(featureName: string): boolean {
    return this.getEnvBoolean(`FEATURE_${featureName.toUpperCase()}`, false);
  }
}

// Create and export a singleton instance
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    audience: process.env.AUTH0_AUDIENCE!,
  },
  mongoUri: process.env.MONGO_URI!,
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
};