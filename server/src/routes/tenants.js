const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const { requireTenantAccess, requireTenantRole, requireSuperAdmin } = require('../middleware/tenantAccess');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// List all tenants (super admin only)
router.get('/', checkJwt, requireSuperAdmin, async (req, res, next) => {
  try {
    const tenants = await Tenant.find()
      .select('-metadata')
      .sort('-createdAt');
    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

// Create new tenant (super admin only)
router.post('/', checkJwt, requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, adminEmail, ...tenantData } = req.body;

    // Find the admin user
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Create tenant
    const tenant = new Tenant({
      name,
      createdBy: req.currentUser.auth0Id,
      ...tenantData
    });
    await tenant.save();

    // Add admin to tenant
    adminUser.tenants.push({
      tenantId: tenant._id,
      role: 'admin',
      status: 'approved',
      approvedBy: req.currentUser.auth0Id,
      approvedAt: new Date()
    });
    await adminUser.save();

    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
});

// Get tenant details
router.get('/:tenantId', checkJwt, requireTenantAccess(), async (req, res, next) => {
  try {
    const tenant = req.currentTenant;
    await tenant.populate('memberCount');
    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

// Update tenant (tenant admin or super admin)
router.patch('/:tenantId', checkJwt, requireTenantRole('admin'), async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'description', 'settings'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const tenant = req.currentTenant;
    Object.assign(tenant, updates);
    await tenant.save();

    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

// List tenant members
router.get('/:tenantId/members', checkJwt, requireTenantAccess(), async (req, res, next) => {
  try {
    const users = await User.find({
      'tenants.tenantId': req.currentTenant._id
    }).select('name email picture tenants');

    const members = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      membership: user.tenants.find(t => 
        t.tenantId.toString() === req.currentTenant._id.toString()
      )
    }));

    res.json(members);
  } catch (error) {
    next(error);
  }
});

// Add member to tenant
router.post('/:tenantId/members', checkJwt, requireTenantRole('admin'), async (req, res, next) => {
  try {
    const { email, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const existingMembership = user.tenants.find(t => 
      t.tenantId.toString() === req.currentTenant._id.toString()
    );

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add user to tenant
    user.tenants.push({
      tenantId: req.currentTenant._id,
      role,
      status: 'approved',
      approvedBy: req.currentUser.auth0Id,
      approvedAt: new Date()
    });
    await user.save();

    res.status(201).json({
      message: 'Member added successfully',
      membership: user.tenants[user.tenants.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// Update member role
router.patch('/:tenantId/members/:userId', checkJwt, requireTenantRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const membershipIndex = user.tenants.findIndex(t => 
      t.tenantId.toString() === req.currentTenant._id.toString()
    );

    if (membershipIndex === -1) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    user.tenants[membershipIndex].role = role;
    await user.save();

    res.json({
      message: 'Member role updated',
      membership: user.tenants[membershipIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Remove member from tenant
router.delete('/:tenantId/members/:userId', checkJwt, requireTenantRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const membershipIndex = user.tenants.findIndex(t => 
      t.tenantId.toString() === req.currentTenant._id.toString()
    );

    if (membershipIndex === -1) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    // Don't allow removing the last admin
    if (user.tenants[membershipIndex].role === 'admin') {
      const adminCount = await User.countDocuments({
        'tenants': {
          $elemMatch: {
            tenantId: req.currentTenant._id,
            role: 'admin',
            status: 'approved'
          }
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot remove the last admin' 
        });
      }
    }

    user.tenants.splice(membershipIndex, 1);
    await user.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
});

// Request to join tenant
router.post('/:tenantId/join', checkJwt, async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (!tenant.isActive()) {
      return res.status(403).json({ message: 'Tenant is not active' });
    }

    const user = await User.findOne({ auth0Id: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const existingMembership = user.tenants.find(t => 
      t.tenantId.toString() === tenant._id.toString()
    );

    if (existingMembership) {
      return res.status(400).json({ message: 'Already a member or pending' });
    }

    // Add pending membership
    user.tenants.push({
      tenantId: tenant._id,
      role: tenant.settings.defaultUserRole,
      status: tenant.settings.requireAdminApproval ? 'pending' : 'approved',
      ...(tenant.settings.requireAdminApproval ? {} : {
        approvedAt: new Date(),
        approvedBy: 'system'
      })
    });
    await user.save();

    res.status(201).json({
      message: tenant.settings.requireAdminApproval 
        ? 'Join request submitted' 
        : 'Joined successfully',
      membership: user.tenants[user.tenants.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// Approve/reject join request
router.post('/:tenantId/requests/:userId', checkJwt, requireTenantRole('admin'), async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const membershipIndex = user.tenants.findIndex(t => 
      t.tenantId.toString() === req.currentTenant._id.toString() &&
      t.status === 'pending'
    );

    if (membershipIndex === -1) {
      return res.status(404).json({ message: 'No pending request found' });
    }

    if (action === 'approve') {
      user.tenants[membershipIndex].status = 'approved';
      user.tenants[membershipIndex].approvedBy = req.currentUser.auth0Id;
      user.tenants[membershipIndex].approvedAt = new Date();
      await user.save();

      res.json({
        message: 'Request approved',
        membership: user.tenants[membershipIndex]
      });
    } else {
      user.tenants.splice(membershipIndex, 1);
      await user.save();

      res.json({ message: 'Request rejected' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;