const express = require('express');
const { checkJwt } = require('../middleware/auth');
const { User } = require('../models/user.model');
const { asyncHandler } = require('../utils/async-handler');
const { ApiError } = require('../utils/errors');
const { logger } = require('../utils/logger');

const router = express.Router();

// Validate Auth0 token data
function validateAuth0Data(auth: any): void {
  if (!auth.sub) {
    throw new ApiError('Invalid Auth0 token: Missing sub claim', 401);
  }
  if (!auth.email) {
    throw new ApiError('Invalid Auth0 token: Missing email claim', 401);
  }
}

// Transform user data to API response format
function transformUserToResponse(user: any, auth0Data: any) {
  try {
    const userObj = user.toJSON();
    
    // Validate required fields
    if (!userObj.email) {
      logger.warn('User missing email field', { userId: user._id });
    }

    return {
      id: auth0Data.sub,
      email: userObj.email,
      name: userObj.name || auth0Data.name,
      picture: auth0Data.picture,
      isSuperAdmin: userObj.tenants.some(t => t.role === 'admin'),
      tenants: userObj.tenants.map(t => ({
        tenantId: t.tenantId.toString(),
        role: t.role,
        // Include additional tenant info if available
        name: t.name,
        status: t.status
      }))
    };
  } catch (error) {
    logger.error('Error transforming user data', {
      error: error.message,
      userId: user._id,
      stack: error.stack
    });
    throw new ApiError('Error processing user data', 500);
  }
}

// Get current user profile with tenant information
router.get('/me', checkJwt, asyncHandler(async (req, res) => {
  const startTime = Date.now();
  logger.info('Fetching user profile', { auth0Id: req.auth.sub });

  try {
    // Validate Auth0 token data
    validateAuth0Data(req.auth);
    const auth0Id = req.auth.sub;

    // Find existing user
    let user = await User.findOne({ auth0Id })
      .select('+email.value') // Explicitly select encrypted email field
      .lean()
      .exec();

    if (!user) {
      logger.info('Creating new user', { auth0Id });
      try {
        // Create new user if not found
        user = await User.create({
          auth0Id,
          email: { value: req.auth.email },
          name: req.auth.name,
          tenants: []
        });
        logger.info('New user created', { userId: user._id });
      } catch (error) {
        logger.error('Error creating new user', {
          error: error.message,
          auth0Id,
          stack: error.stack
        });
        throw new ApiError('Failed to create user profile', 500);
      }
    }

    // Transform and validate response
    const response = transformUserToResponse(user, req.auth);

    // Log performance metrics
    const duration = Date.now() - startTime;
    logger.info('User profile fetched successfully', {
      userId: user._id,
      duration,
      tenantCount: response.tenants.length
    });

    res.json(response);
  } catch (error) {
    // Log detailed error information
    logger.error('Error in /users/me endpoint', {
      error: error.message,
      auth0Id: req.auth?.sub,
      stack: error.stack,
      duration: Date.now() - startTime
    });

    // If it's not an ApiError, convert to 500
    if (!(error instanceof ApiError)) {
      error = new ApiError('Internal server error', 500);
    }

    throw error;
  }
}));

module.exports = router;