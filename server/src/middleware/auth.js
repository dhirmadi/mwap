const { auth } = require('express-oauth2-jwt-bearer');
const env = require('../config/environment');

// Create Auth0 middleware with proper configuration
const checkJwt = auth({
  audience: env.auth0.audience,
  issuer: `https://${env.auth0.domain}/`,
  jwksUri: `https://${env.auth0.domain}/.well-known/jwks.json`,
  tokenSigningAlg: 'RS256'
});

// Wrap the middleware to add better error handling
const authMiddleware = (req, res, next) => {
  checkJwt(req, res, (err) => {
    if (err) {
      console.error('Auth error:', {
        error: err.message,
        code: err.status || 500,
        type: err.name,
        url: req.url,
      });

      return res.status(err.status || 401).json({
        error: 'Authentication failed',
        message: err.message,
        code: err.status || 401
      });
    }
    next();
  });
};

module.exports = { checkJwt: authMiddleware };