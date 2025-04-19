import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from '../config/environment';
import { constants } from '../config/constants';

// CORS configuration with enhanced security
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void, req?: Request) => {
    // Allow requests with no origin (same-origin requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check against allowed patterns from constants
    const { allowedOrigins } = constants.security.cors;

    if (allowedOrigins.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    // Log all CORS requests with helpful information
    console.log('CORS request:', {
      origin,
      method: req?.method || 'unknown',
      url: req?.url || 'unknown',
      headers: req?.headers || {},
      allowedPatterns: allowedOrigins.map(p => p.toString()),
      appDomain: process.env.HEROKU_APP_DEFAULT_DOMAIN_NAME || process.env.HEROKU_APP_NAME,
      isAllowed: allowedOrigins.some(pattern => pattern.test(origin))
    });
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Response-Time'],
  maxAge: constants.security.cors.maxAge
};

// Rate limiting with different configs for production and development
const createLimiter = (windowMs: number, max: number, prefix: string = '') => rateLimit({
  windowMs,
  max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For header if available (for Heroku)
    const realIP = (req.headers['x-forwarded-for'] as string) || req.ip;
    return `${prefix}${realIP}`;
  },
  skip: (req: Request): boolean => env.isDevelopment() // Skip rate limiting in development
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
          `http://localhost:${process.env.PORT || '3000'}`
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
  const { rateLimits } = constants.security;
  app.use('/api/auth', createLimiter(rateLimits.auth.windowMs, rateLimits.auth.max, 'auth:')); // Auth endpoints
  app.use('/api', createLimiter(rateLimits.api.windowMs, rateLimits.api.max, 'api:')); // API endpoints
  app.use(createLimiter(rateLimits.global.windowMs, rateLimits.global.max)); // Global rate limit

  // Security best practices
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Trust first proxy (important for Heroku)

  // Add security headers
  const securityHeadersMiddleware: express.RequestHandler = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (env.isProduction()) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  };
  app.use(securityHeadersMiddleware);

  // Validate content types
  const validateContentTypeMiddleware: express.RequestHandler = (req, res, next) => {
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
  app.use(validateContentTypeMiddleware);
};