import { Application, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import environment from '../config/environment';

// CORS configuration with enhanced security
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (same-origin requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check against allowed patterns
    const allowedPatterns = [
      /^http:\/\/localhost:5173$/,
      /^https:\/\/[a-zA-Z0-9-]+\.herokuapp\.com$/
    ];

    if (allowedPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    // Log blocked requests with helpful information
    console.log('CORS blocked request:', {
      origin,
      allowedPatterns: [
        'http://localhost:5173',
        'https://*.herokuapp.com'
      ],
      appDomain: process.env.HEROKU_APP_DEFAULT_DOMAIN_NAME || process.env.HEROKU_APP_NAME
    });
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Response-Time'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

// Rate limiting with different configs for production and development
const createLimiter = (windowMs: number, max: number, prefix = '') => rateLimit({
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
  skip: () => environment.isDevelopment() // Skip rate limiting in development
});

// Security middleware setup
export const setupSecurity = (app: Application): void => {
  // Enhanced security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://*.auth0.com',
          'https://cdn.auth0.com'
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.auth0.com'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https:',
          'blob:',
          'https://*.auth0.com',
          'https://s.gravatar.com'
        ],
        connectSrc: [
          "'self'",
          'https://*.auth0.com',
          'https://*.herokuapp.com',
          'https://cdn.auth0.com',
          'http://localhost:5173',
          'http://localhost:3000'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdn.auth0.com',
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
        upgradeInsecureRequests: environment.isProduction() ? [] : null
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

  // Add security headers and validate content types
  const securityMiddleware: RequestHandler = (req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (environment.isProduction()) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Validate content types for POST, PUT, PATCH requests
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        res.status(415).json({
          error: 'Unsupported Media Type - API only accepts application/json'
        });
        return;
      }
    }
    next();
  };

  app.use(securityMiddleware);
};