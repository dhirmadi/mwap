export const PROJECT_CONFIG = {
  CLOUD_PROVIDERS: ['gdrive', 'dropbox', 'box', 'onedrive'] as const,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000
};

export const constants = {
  development: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || '3000'}/api`,
  },
  production: {
    frontendUrl: process.env.FRONTEND_URL,
    apiUrl: process.env.API_URL,
  },
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    audience: process.env.AUTH0_AUDIENCE,
  },
  security: {
    rateLimits: {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '25'), // 25 requests per window
      },
      api: {
        windowMs: 60 * 1000, // 1 minute
        max: parseInt(process.env.API_RATE_LIMIT_MAX || '100'), // 100 requests per window
      },
      global: {
        windowMs: 60 * 1000, // 1 minute
        max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX || '250'), // 250 requests per window
      },
    },
    cors: {
      allowedOrigins: [
        // Development origins
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^http:\/\/0\.0\.0\.0(:\d+)?$/,
        // Production origins
        /^https:\/\/[a-zA-Z0-9-]+\.herokuapp\.com$/,
        // Add your production domain here if different from Heroku
      ],
      maxAge: 600, // 10 minutes
    },
  },
};