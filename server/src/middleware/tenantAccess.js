const User = require('../models/User');
const Tenant = require('../models/Tenant');

/**
 * Middleware to check if the user has access to the tenant
 * @param {string} tenantParam - The parameter name containing the tenant ID/slug (default: 'tenantId')
 * @param {boolean} allowSuperAdmin - Whether to allow super admins to bypass tenant check (default: true)
 */
const requireTenantAccess = (tenantParam = 'tenantId', allowSuperAdmin = true) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ auth0Id: req.user.sub });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Super admin bypass
      if (allowSuperAdmin && user.isSuperAdmin) {
        req.currentUser = user;
        return next();
      }

      const tenantIdentifier = req.params[tenantParam];
      if (!tenantIdentifier) {
        return res.status(400).json({ message: 'Tenant identifier not provided' });
      }

      // Find tenant by ID or slug
      const tenant = mongoose.Types.ObjectId.isValid(tenantIdentifier)
        ? await Tenant.findById(tenantIdentifier)
        : await Tenant.findBySlug(tenantIdentifier);

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      if (!tenant.isActive()) {
        return res.status(403).json({ message: 'Tenant is not active' });
      }

      if (!user.canAccessTenant(tenant._id)) {
        return res.status(403).json({ message: 'Access denied to this tenant' });
      }

      // Attach user and tenant to request
      req.currentUser = user;
      req.currentTenant = tenant;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if the user has specific role in the tenant
 * @param {string|string[]} roles - Required role(s)
 * @param {string} tenantParam - The parameter name containing the tenant ID/slug
 */
const requireTenantRole = (roles, tenantParam = 'tenantId') => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ auth0Id: req.user.sub });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Super admin bypass
      if (user.isSuperAdmin) {
        req.currentUser = user;
        return next();
      }

      const tenantIdentifier = req.params[tenantParam];
      if (!tenantIdentifier) {
        return res.status(400).json({ message: 'Tenant identifier not provided' });
      }

      // Find tenant by ID or slug
      const tenant = mongoose.Types.ObjectId.isValid(tenantIdentifier)
        ? await Tenant.findById(tenantIdentifier)
        : await Tenant.findBySlug(tenantIdentifier);

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      if (!tenant.isActive()) {
        return res.status(403).json({ message: 'Tenant is not active' });
      }

      const hasRequiredRole = allowedRoles.some(role => user.hasRole(tenant._id, role));
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          message: `Required role(s): ${allowedRoles.join(', ')}` 
        });
      }

      // Attach user and tenant to request
      req.currentUser = user;
      req.currentTenant = tenant;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require super admin access
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireTenantAccess,
  requireTenantRole,
  requireSuperAdmin
};