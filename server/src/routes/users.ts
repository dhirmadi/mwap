const express = require('express');
const { checkJwt } = require('../middleware/auth');
const { User } = require('../models/user.model');
const { SuperAdmin } = require('../models/super-admin.model');
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
async function transformUserToResponse(user: any, auth0Data: any) {
  try {
    // Handle both Mongoose documents and lean objects
    const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user;
    
    // Debug log the raw user object structure
    logger.debug('Raw user object:', {
      userId: userObj._id,
      hasEmail: !!userObj.email,
      hasTenants: !!userObj.tenants,
      tenantsIsArray: Array.isArray(userObj.tenants),
      tenantsLength: userObj.tenants?.length
    });

    // Validate and normalize tenants array
    const tenants = Array.isArray(userObj.tenants) ? userObj.tenants : [];
    
    // Log warning if tenants array is missing or malformed
    if (!userObj.tenants) {
      logger.warn('User tenants array is missing', { 
        userId: userObj._id,
        auth0Id: auth0Data.sub 
      });
    } else if (!Array.isArray(userObj.tenants)) {
      logger.warn('User tenants is not an array', { 
        userId: userObj._id,
        auth0Id: auth0Data.sub,
        tenantsType: typeof userObj.tenants 
      });
    }

    // Check if user is a super admin
    const isSuperAdmin = await SuperAdmin.exists({ auth0Id: auth0Data.sub });
    logger.debug('Super admin check:', { 
      auth0Id: auth0Data.sub, 
      isSuperAdmin: !!isSuperAdmin 
    });

    // Safely transform tenant data with null coalescing
    const transformedTenants = tenants.map(t => {
      // Log warning if tenant or tenantId is malformed
      if (!t.tenantId) {
        logger.warn('Tenant missing tenantId', {
          userId: userObj._id,
          tenant: t
        });
      }

      return {
        tenantId: t.tenantId?._id?.toString() ?? t.tenantId?.toString() ?? '',
        role: t.role ?? 'contributor',
        name: t.tenantId?.name ?? 'Unknown Tenant',
        status: t.tenantId?.status ?? 'pending'
      };
    });

    // Construct the response with safe fallbacks
    return {
      id: auth0Data.sub,
      email: userObj.email?.value ?? userObj.email ?? auth0Data.email ?? '',
      name: userObj.name ?? auth0Data.name ?? 'Unknown User',
      picture: auth0Data.picture ?? null,
      isSuperAdmin: !!isSuperAdmin,
      tenants: transformedTenants
    };
  } catch (error) {
    logger.error('Error transforming user data', {
      error: error.message,
      userId: user?._id,
      auth0Id: auth0Data?.sub,
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

    // Find existing user with populated tenant details
    let user = await User.findOne({ auth0Id })
      .select('+email.value') // Explicitly select encrypted email field
      .populate('tenants.tenantId', 'name status') // Populate tenant details
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

    // Log tenant data for debugging
    logger.debug('User tenant data before transform:', {
      userId: user._id,
      tenants: user.tenants.map(t => ({
        tenantId: t.tenantId?._id,
        name: t.tenantId?.name,
        role: t.role,
        status: t.tenantId?.status
      }))
    });

    // Transform and validate response
    const response = await transformUserToResponse(user, req.auth);

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