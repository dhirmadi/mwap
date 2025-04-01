const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/tenantAccess');
const superAdminService = require('../services/superAdmin');

// Get all super admins (super admin only)
router.get('/', checkJwt, requireSuperAdmin, async (req, res, next) => {
  try {
    const superAdmins = await superAdminService.getSuperAdmins();
    res.json(superAdmins);
  } catch (error) {
    next(error);
  }
});

// Designate a user as super admin (super admin only)
router.post('/', checkJwt, requireSuperAdmin, async (req, res, next) => {
  try {
    const { auth0Id, email, name } = req.body;
    
    if (!auth0Id || !email || !name) {
      return res.status(400).json({ 
        message: 'auth0Id, email, and name are required' 
      });
    }

    const user = await superAdminService.designateSuperAdmin(auth0Id, email, name);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Revoke super admin status (super admin only)
router.delete('/:auth0Id', checkJwt, requireSuperAdmin, async (req, res, next) => {
  try {
    // Prevent revoking your own super admin status
    if (req.params.auth0Id === req.user.sub) {
      return res.status(400).json({
        message: 'Cannot revoke your own super admin status'
      });
    }

    const user = await superAdminService.revokeSuperAdmin(req.params.auth0Id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Check if current user is super admin
router.get('/check', checkJwt, async (req, res, next) => {
  try {
    const isSuperAdmin = await superAdminService.isSuperAdmin(req.user.sub);
    res.json({ isSuperAdmin });
  } catch (error) {
    next(error);
  }
});

module.exports = router;