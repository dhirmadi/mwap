const User = require('../models/User');

/**
 * Designate a user as super admin
 * @param {string} auth0Id - Auth0 user ID (sub)
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @returns {Promise<User>} The updated user document
 */
async function designateSuperAdmin(auth0Id, email, name) {
  try {
    // Find or create user
    let user = await User.findOne({ auth0Id });
    
    if (!user) {
      user = new User({
        auth0Id,
        email,
        name,
        globalRoles: ['super_admin']
      });
    } else {
      // Add super_admin role if not already present
      if (!user.globalRoles.includes('super_admin')) {
        user.globalRoles.push('super_admin');
      }
    }

    await user.save();
    return user;
  } catch (error) {
    console.error('Error designating super admin:', error);
    throw error;
  }
}

/**
 * Remove super admin designation from a user
 * @param {string} auth0Id - Auth0 user ID (sub)
 * @returns {Promise<User>} The updated user document
 */
async function revokeSuperAdmin(auth0Id) {
  try {
    const user = await User.findOne({ auth0Id });
    if (!user) {
      throw new Error('User not found');
    }

    // Remove super_admin role
    user.globalRoles = user.globalRoles.filter(role => role !== 'super_admin');
    await user.save();
    return user;
  } catch (error) {
    console.error('Error revoking super admin:', error);
    throw error;
  }
}

/**
 * Get all super admin users
 * @returns {Promise<User[]>} List of super admin users
 */
async function getSuperAdmins() {
  try {
    return await User.find({
      globalRoles: 'super_admin'
    }).select('-tenants');
  } catch (error) {
    console.error('Error getting super admins:', error);
    throw error;
  }
}

/**
 * Check if a user is a super admin
 * @param {string} auth0Id - Auth0 user ID (sub)
 * @returns {Promise<boolean>} True if user is super admin
 */
async function isSuperAdmin(auth0Id) {
  try {
    const user = await User.findOne({ auth0Id });
    return user ? user.isSuperAdmin : false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    throw error;
  }
}

module.exports = {
  designateSuperAdmin,
  revokeSuperAdmin,
  getSuperAdmins,
  isSuperAdmin
};