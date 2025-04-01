const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const env = require('../config/environment');

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      env.security.corsOrigin,
      // Allow all Heroku app domains
      /\.herokuapp\.com$/,
    ];

    // Check if the origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' 
        ? allowed === origin
        : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  max: env.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.'
});

// Security middleware setup
const setupSecurity = (app) => {
  // Basic security headers
  app.use(helmet());

  // CORS
  app.use(cors(corsOptions));

  // Rate limiting
  app.use(limiter);

  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));

  // Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.auth0.com', 'https://*.herokuapp.com'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }));

  // Additional security headers
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());

  // Remove X-Powered-By header
  app.disable('x-powered-by');
};

module.exports = setupSecurity;