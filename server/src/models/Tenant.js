const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String, // Auth0 ID of the creator
    ref: 'User',
    required: true
  },
  settings: {
    allowPublicRegistration: {
      type: Boolean,
      default: false
    },
    requireAdminApproval: {
      type: Boolean,
      default: true
    },
    defaultUserRole: {
      type: String,
      enum: ['editor', 'user'],
      default: 'user'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
tenantSchema.index({ slug: 1 });
tenantSchema.index({ createdBy: 1 });
tenantSchema.index({ status: 1 });

// Virtual for getting member count
tenantSchema.virtual('memberCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'tenants.tenantId',
  count: true
});

// Pre-save hook to generate slug if not provided
tenantSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Methods
tenantSchema.methods.isActive = function() {
  return this.status === 'active';
};

tenantSchema.methods.suspend = function() {
  this.status = 'suspended';
  return this.save();
};

tenantSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// Statics
tenantSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

tenantSchema.statics.findActiveBySlug = function(slug) {
  return this.findOne({ 
    slug: slug.toLowerCase(),
    status: 'active'
  });
};

module.exports = mongoose.model('Tenant', tenantSchema);