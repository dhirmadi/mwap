const mongoose = require('mongoose');

const ROLES = ['super_admin', 'admin', 'editor', 'user'];
const TENANT_STATUS = ['pending', 'approved'];

const tenantMembershipSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'user'],
    required: true
  },
  status: {
    type: String,
    enum: TENANT_STATUS,
    default: 'pending'
  },
  approvedBy: {
    type: String, // Auth0 ID of the approver
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  globalRoles: [{
    type: String,
    enum: ROLES
  }],
  tenants: [tenantMembershipSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'tenants.tenantId': 1 });

// Virtual for checking if user is super admin
userSchema.virtual('isSuperAdmin').get(function() {
  return this.globalRoles.includes('super_admin');
});

// Methods for role checks
userSchema.methods.hasRole = function(tenantId, role) {
  const membership = this.tenants.find(t => 
    t.tenantId.toString() === tenantId.toString() && 
    t.status === 'approved'
  );
  return membership && membership.role === role;
};

userSchema.methods.canAccessTenant = function(tenantId) {
  return this.isSuperAdmin || this.tenants.some(t => 
    t.tenantId.toString() === tenantId.toString() && 
    t.status === 'approved'
  );
};

userSchema.methods.isAdminOfTenant = function(tenantId) {
  return this.hasRole(tenantId, 'admin');
};

// Constants exposed for use in other parts of the application
userSchema.statics.ROLES = ROLES;
userSchema.statics.TENANT_STATUS = TENANT_STATUS;

module.exports = mongoose.model('User', userSchema);