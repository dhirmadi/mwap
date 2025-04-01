const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const env = require('../config/environment');

// CORS configuration with enhanced security
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin in development
    if (!origin && env.isDevelopment()) {
      return callback(null, true);
    }

    // Allow direct access to the app's own domain
    const appDomain = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    if (origin === appDomain) {
      return callback(null, true);
    }

    // Allow specific domains
    const allowedOrigins = [
      env.security.corsOrigin,
      'https://mwap-staging-a88e5b681617.herokuapp.com',
      'https://mwap-production-d5a4ed63debf.herokuapp.com'
    ];

    // Check if the origin matches any allowed pattern
    const isAllowed = allowedOrigins.includes(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Response-Time'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

// Rate limiting with different configs for production and development
const createLimiter = (windowMs, max, prefix = '') => rateLimit({
  windowMs,
  max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (for Heroku)
    const realIP = req.headers['x-forwarded-for'] || req.ip;
    return `${prefix}${realIP}`;
  },
  skip: (req) => env.isDevelopment() // Skip rate limiting in development
});

// Security middleware setup
const setupSecurity = (app) => {
  // Enhanced security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://*.auth0.com'
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https:',
          'blob:'
        ],
        connectSrc: [
          "'self'",
          'https://*.auth0.com',
          'https://*.herokuapp.com',
          ...(env.isDevelopment() ? ['http://localhost:*'] : [])
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:'
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: [
          "'self'",
          'https://*.auth0.com'
        ],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: env.isProduction() ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false, // Required for Auth0
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Required for external resources
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  // CORS
  app.use(cors(corsOptions));

  // Rate limiting for different endpoints
  app.use('/api/auth', createLimiter(15 * 60 * 1000, 25, 'auth:')); // 25 requests per 15 minutes for auth
  app.use('/api', createLimiter(60 * 1000, 100, 'api:')); // 100 requests per minute for API
  app.use(createLimiter(60 * 1000, 250)); // 250 requests per minute overall

  // Security best practices
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Trust first proxy (important for Heroku)

  // Add security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (env.isProduction()) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  // Validate content types
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(415).json({
          error: 'Unsupported Media Type - API only accepts application/json'
        });
      }
    }
    next();
  });
};

module.exports = setupSecurity;